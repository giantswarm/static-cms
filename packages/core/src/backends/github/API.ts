import { Base64 } from 'js-base64';
import initial from 'lodash/initial';
import last from 'lodash/last';
import partial from 'lodash/partial';
import result from 'lodash/result';
import trim from 'lodash/trim';
import trimStart from 'lodash/trimStart';
import { dirname } from 'path';

import {
  APIError,
  basename,
  generateContentKey,
  getAllResponses,
  localForage,
  parseContentKey,
  readFileMetadata,
  requestWithBackoff,
  unsentRequest,
} from '@staticcms/core/lib/util';
import { switchBranch } from '@staticcms/core/actions/config';

import type { DataFile, PersistOptions } from '@staticcms/core/interface';
import type { ApiRequest, FetchError } from '@staticcms/core/lib/util';
import type AssetProxy from '@staticcms/core/valueObjects/AssetProxy';
import type { Semaphore } from 'semaphore';
import type {
  GitCreateCommitResponse,
  GitCreateRefResponse,
  GitCreateTreeParamsTree,
  GitCreateTreeResponse,
  GitGetBlobResponse,
  GitGetTreeResponse,
  GitHubAuthor,
  GitHubCommitter,
  GitHubUser,
  GitUpdateRefResponse,
  ReposGetBranchResponse,
  ReposGetResponse,
  ReposListCommitsResponse,
  GitCreatePullResponse,
  ReposGetBranchesResponse,
  GitGetPullsResponse,
} from './types';

export const API_NAME = 'GitHub';

export interface Config {
  apiRoot?: string;
  token?: string;
  branch?: string;
  is_feature_branch?: string;
  repo?: string;
  originRepo?: string;
}

type Override<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

type TreeEntry = Override<GitCreateTreeParamsTree, { sha: string | null }>;

interface MetaDataObjects {
  entry: { path: string; sha: string };
  files: MediaFile[];
}

export interface Metadata {
  type: string;
  objects: MetaDataObjects;
  branch: string;
  status: string;
  collection: string;
  commitMessage: string;
  version?: string;
  user: string;
  title?: string;
  description?: string;
  timeStamp: string;
}

export interface BlobArgs {
  sha: string;
  repoURL: string;
  parseText: boolean;
}

type Param = string | number | undefined;

export type Options = RequestInit & {
  params?: Record<string, Param | Record<string, Param> | string[]>;
};

type MediaFile = {
  sha: string;
  path: string;
};

export type Diff = {
  path: string;
  newFile: boolean;
  sha: string;
  binary: boolean;
};

export default class API {
  apiRoot: string;
  token: string;
  branch: string;
  repo: string;
  originRepo: string;
  repoOwner: string;
  repoName: string;
  originRepoOwner: string;
  originRepoName: string;
  repoURL: string;
  originRepoURL: string;

  _userPromise?: Promise<GitHubUser>;
  _metadataSemaphore?: Semaphore;

  commitAuthor?: {};

  constructor(config: Config) {
    this.apiRoot = config.apiRoot || 'https://api.github.com';
    this.token = config.token || '';
    this.branch = config.branch || 'main';
    this.repo = config.repo || '';
    this.originRepo = config.originRepo || this.repo;
    this.repoURL = `/repos/${this.repo}`;
    this.originRepoURL = `/repos/${this.originRepo}`;

    const [repoParts, originRepoParts] = [this.repo.split('/'), this.originRepo.split('/')];
    this.repoOwner = repoParts[0];
    this.repoName = repoParts[1];

    this.originRepoOwner = originRepoParts[0];
    this.originRepoName = originRepoParts[1];
  }

  static DEFAULT_COMMIT_MESSAGE = 'Automatically generated by Static CMS';

  user(): Promise<{ name: string; login: string }> {
    if (!this._userPromise) {
      this._userPromise = this.getUser();
    }
    return this._userPromise;
  }

  getUser() {
    return this.request('/user') as Promise<GitHubUser>;
  }

  async hasWriteAccess() {
    try {
      const result: ReposGetResponse = await this.request(this.repoURL);
      // update config repoOwner to avoid case sensitivity issues with GitHub
      this.repoOwner = result.owner.login;
      return result.permissions.push;
    } catch (error) {
      console.error('Problem fetching repo data from GitHub');
      throw error;
    }
  }

  reset() {
    // no op
  }

  requestHeaders(headers = {}) {
    const baseHeader: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    };

    if (this.token) {
      baseHeader.Authorization = `token ${this.token}`;
      return Promise.resolve(baseHeader);
    }

    return Promise.resolve(baseHeader);
  }

  parseJsonResponse(response: Response) {
    return response.json().then(json => {
      if (!response.ok) {
        return Promise.reject(json);
      }

      return json;
    });
  }

  urlFor(path: string, options: Options) {
    const params = [];
    if (options.params) {
      for (const key in options.params) {
        params.push(`${key}=${encodeURIComponent(options.params[key] as string)}`);
      }
    }
    if (params.length) {
      path += `?${params.join('&')}`;
    }
    return this.apiRoot + path;
  }

  parseResponse(response: Response) {
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.match(/json/)) {
      return this.parseJsonResponse(response);
    }
    const textPromise = response.text().then(text => {
      if (!response.ok) {
        return Promise.reject(text);
      }
      return text;
    });
    return textPromise;
  }

  handleRequestError(error: FetchError, responseStatus: number) {
    throw new APIError(error.message, responseStatus, API_NAME);
  }

  buildRequest(req: ApiRequest) {
    return req;
  }

  async request(
    path: string,
    options: Options = {},
    parser = (response: Response) => this.parseResponse(response),
  ) {
    options = { cache: 'no-cache', ...options };
    const headers = await this.requestHeaders(options.headers || {});
    const url = this.urlFor(path, options);
    let responseStatus = 500;

    try {
      const req = unsentRequest.fromFetchArguments(url, {
        ...options,
        headers,
      }) as unknown as ApiRequest;
      const response = await requestWithBackoff(this, req);
      responseStatus = response.status;
      const parsedResponse = await parser(response);
      return parsedResponse;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return this.handleRequestError(error, responseStatus);
    }
  }

  nextUrlProcessor() {
    return (url: string) => url;
  }

  async requestAllPages<T>(url: string, options: Options = {}) {
    options = { cache: 'no-cache', ...options };
    const headers = await this.requestHeaders(options.headers || {});
    const processedURL = this.urlFor(url, options);
    const allResponses = await getAllResponses(
      processedURL,
      { ...options, headers },
      'next',
      this.nextUrlProcessor(),
    );
    const pages: T[][] = await Promise.all(
      allResponses.map((res: Response) => this.parseResponse(res)),
    );
    return ([] as T[]).concat(...pages);
  }

  generateContentKey(collectionName: string, slug: string) {
    return generateContentKey(collectionName, slug);
  }

  parseContentKey(contentKey: string) {
    return parseContentKey(contentKey);
  }

  async readFile(
    path: string,
    sha?: string | null,
    {
      branch = this.branch,
      repoURL = this.repoURL,
      parseText = true,
    }: {
      branch?: string;
      repoURL?: string;
      parseText?: boolean;
    } = {},
  ) {
    if (!sha) {
      sha = await this.getFileSha(path, { repoURL, branch });
    }
    const content = await this.fetchBlobContent({ sha: sha as string, repoURL, parseText });
    return content;
  }

  async readFileMetadata(path: string, sha: string | null | undefined) {
    const fetchFileMetadata = async () => {
      try {
        const result: ReposListCommitsResponse = await this.request(
          `${this.originRepoURL}/commits`,
          {
            params: { path, sha: this.branch },
          },
        );
        const { commit } = result[0];
        return {
          author: commit.author.name || commit.author.email,
          updatedOn: commit.author.date,
        };
      } catch (e) {
        return { author: '', updatedOn: '' };
      }
    };
    const fileMetadata = await readFileMetadata(sha, fetchFileMetadata, localForage);
    return fileMetadata;
  }

  async fetchBlobContent({ sha, repoURL, parseText }: BlobArgs) {
    const result: GitGetBlobResponse = await this.request(`${repoURL}/git/blobs/${sha}`, {
      cache: 'force-cache',
    });

    if (parseText) {
      // treat content as a utf-8 string
      const content = Base64.decode(result.content);
      return content;
    } else {
      // treat content as binary and convert to blob
      const content = Base64.atob(result.content);
      const byteArray = new Uint8Array(content.length);
      for (let i = 0; i < content.length; i++) {
        byteArray[i] = content.charCodeAt(i);
      }
      const blob = new Blob([byteArray]);
      return blob;
    }
  }

  async listFiles(
    path: string,
    { repoURL = this.repoURL, branch = this.branch, depth = 1 } = {},
    folderSupport?: boolean,
  ): Promise<{ type: string; id: string; name: string; path: string; size: number }[]> {
    const folder = trim(path, '/');
    try {
      const result: GitGetTreeResponse = await this.request(
        `${repoURL}/git/trees/${branch}:${folder}`,
        {
          // GitHub API supports recursive=1 for getting the entire recursive tree
          // or omitting it to get the non-recursive tree
          params: depth > 1 ? { recursive: 1 } : {},
        },
      );
      return (
        result.tree
          // filter only files and/or folders up to the required depth
          .filter(
            file =>
              (!folderSupport ? file.type === 'blob' : true) &&
              file.path.split('/').length <= depth,
          )
          .map(file => ({
            type: file.type,
            id: file.sha,
            name: basename(file.path),
            path: `${folder}/${file.path}`,
            size: file.size!,
          }))
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err && err.status === 404) {
        console.info('[StaticCMS] This 404 was expected and handled appropriately.');
        return [];
      } else {
        throw err;
      }
    }
  }

  generateEditLink(targetBranch: string) {
    const url = new URL(window.location.href);
    url.searchParams.set('branch', targetBranch);
    return '' + url;
  }

  async persistFiles(dataFiles: DataFile[], mediaFiles: AssetProxy[], options: PersistOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const files: (DataFile | AssetProxy)[] = mediaFiles.concat(dataFiles as any);
    const uploadPromises = files.map(file => this.uploadBlob(file));
    await Promise.all(uploadPromises);

    const createBranchNameParts = (login: string) => {
      const pathSlug = (dataFiles[0]?.path || mediaFiles[0]?.path || '')
        .toLowerCase()
        .replace(/[^/\-_.a-z0-9]+/g, '-');
      return ['change', pathSlug, 'by', login, 'at', ''+Math.round(Date.now() / 1000)];
    };

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const user = await this.user();
    const branchData = await this.getDefaultBranch();
    const targetBranchParts = branchData.protected ? createBranchNameParts(user.login) : [this.branch];
    const branchName = targetBranchParts.join('-');
    const prTitle = capitalize(targetBranchParts.join(' '));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const changeTree = await this.updateTree(branchData.commit.sha, files as any);
    const commitResponse = await this.commit(options.commitMessage, changeTree);
    try {
      await this.createBranch(branchName, commitResponse.sha);
    } catch (e) {
      if (e instanceof APIError && (e.status === 409 || e.status === 422)) {
        await this.patchBranch(branchName, commitResponse.sha);
      } else {
        throw e;
      }
    }

    if (branchData.protected) {
      const body =
        options.commitMessage + `\n\n**[Edit this PR](${this.generateEditLink(branchName)})**`;
      try {
        await this.createPull(prTitle, body, branchName, this.branch);
        switchBranch(branchName);
      } catch (e) {
        if (e instanceof APIError && e.status !== 409 && e.status !== 422) {
          throw e;
        }
      }
    }

    return commitResponse;
  }

  async getFileSha(path: string, { repoURL = this.repoURL, branch = this.branch } = {}) {
    /**
     * We need to request the tree first to get the SHA. We use extended SHA-1
     * syntax (<rev>:<path>) to get a blob from a tree without having to recurse
     * through the tree.
     */

    const pathArray = path.split('/');
    const filename = last(pathArray);
    const directory = initial(pathArray).join('/');
    const fileDataPath = encodeURIComponent(directory);
    const fileDataURL = `${repoURL}/git/trees/${branch}:${fileDataPath}`;

    const result: GitGetTreeResponse = await this.request(fileDataURL);
    const file = result.tree.find(file => file.path === filename);
    if (file) {
      return file.sha;
    } else {
      throw new APIError('Not Found', 404, API_NAME);
    }
  }

  async deleteFiles(paths: string[], message: string) {
    const branchData = await this.getDefaultBranch();
    const files = paths.map(path => ({ path, sha: null }));
    const changeTree = await this.updateTree(branchData.commit.sha, files);
    const commit = await this.commit(message, changeTree);
    await this.patchBranch(this.branch, commit.sha);
  }

  async createRef(type: string, name: string, sha: string) {
    const result: GitCreateRefResponse = await this.request(`${this.repoURL}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/${type}/${name}`, sha }),
    });
    return result;
  }

  async patchRef(type: string, name: string, sha: string) {
    const result: GitUpdateRefResponse = await this.request(
      `${this.repoURL}/git/refs/${type}/${encodeURIComponent(name)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ sha }),
      },
    );
    return result;
  }

  deleteRef(type: string, name: string) {
    return this.request(`${this.repoURL}/git/refs/${type}/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  }

  async getDefaultBranch() {
    const result: ReposGetBranchResponse = await this.request(
      `${this.originRepoURL}/branches/${encodeURIComponent(this.branch)}`,
    );
    return result;
  }

  createBranch(branchName: string, sha: string) {
    return this.createRef('heads', branchName, sha);
  }

  patchBranch(branchName: string, sha: string) {
    return this.patchRef('heads', branchName, sha);
  }

  async getBranches() {
    const result: ReposGetBranchesResponse = await this.request(`${this.originRepoURL}/branches`);
    return result;
  }

  async getHeadReference(head: string) {
    return `${this.repoOwner}:${head}`;
  }

  async createPull(title: string, body: string, head: string, base: string) {
    const result: GitCreatePullResponse = await this.request(`${this.repoURL}/pulls`, {
      method: 'POST',
      body: JSON.stringify({ title, body, head, base }),
    });
    return result;
  }

  async getPulls() {
    const result: GitGetPullsResponse = await this.request(`${this.repoURL}/pulls`);
    return result;
  }

  toBase64(str: string) {
    return Promise.resolve(Base64.encode(str));
  }

  async uploadBlob(item: { raw?: string; sha?: string; toBase64?: () => Promise<string> }) {
    const contentBase64 = await result(
      item,
      'toBase64',
      partial(this.toBase64, item.raw as string),
    );
    const response = await this.request(`${this.repoURL}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({
        content: contentBase64,
        encoding: 'base64',
      }),
    });
    item.sha = response.sha;
    return item;
  }

  async updateTree(
    baseSha: string,
    files: { path: string; sha: string | null; newPath?: string }[],
    branch = this.branch,
  ) {
    const toMove: { from: string; to: string; sha: string }[] = [];
    const tree = files.reduce((acc, file) => {
      const entry = {
        path: trimStart(file.path, '/'),
        mode: '100644',
        type: 'blob',
        sha: file.sha,
      } as TreeEntry;

      if (file.newPath) {
        toMove.push({ from: file.path, to: file.newPath, sha: file.sha as string });
      } else {
        acc.push(entry);
      }

      return acc;
    }, [] as TreeEntry[]);

    for (const { from, to, sha } of toMove) {
      const sourceDir = dirname(from);
      const destDir = dirname(to);
      const files = await this.listFiles(sourceDir, { branch, depth: 100 });
      for (const file of files) {
        // delete current path
        tree.push({
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: null,
        });
        // create in new path
        tree.push({
          path: file.path.replace(sourceDir, destDir),
          mode: '100644',
          type: 'blob',
          sha: file.path === from ? sha : file.id,
        });
      }
    }

    const newTree = await this.createTree(baseSha, tree);
    return { ...newTree, parentSha: baseSha };
  }

  async createTree(baseSha: string, tree: TreeEntry[]) {
    const result: GitCreateTreeResponse = await this.request(`${this.repoURL}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: baseSha, tree }),
    });
    return result;
  }

  commit(message: string, changeTree: { parentSha?: string; sha: string }) {
    const parents = changeTree.parentSha ? [changeTree.parentSha] : [];
    return this.createCommit(message, changeTree.sha, parents);
  }

  async createCommit(
    message: string,
    treeSha: string,
    parents: string[],
    author?: GitHubAuthor,
    committer?: GitHubCommitter,
  ) {
    const result: GitCreateCommitResponse = await this.request(`${this.repoURL}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({ message, tree: treeSha, parents, author, committer }),
    });
    return result;
  }
}
