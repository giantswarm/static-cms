import deepmerge from 'deepmerge';
import { produce } from 'immer';
import trim from 'lodash/trim';
import trimStart from 'lodash/trimStart';
import yaml from 'yaml';

import { resolveBackend } from '@staticcms/core/backend';
import {BRANCH_SWITCH, CONFIG_FAILURE, CONFIG_REQUEST, CONFIG_SUCCESS} from '../constants';
import validateConfig from '../constants/configSchema';
import {
  I18N,
  I18N_FIELD_NONE,
  I18N_FIELD_TRANSLATE,
  I18N_STRUCTURE_SINGLE_FILE,
} from '../lib/i18n';
import { selectDefaultSortableFields } from '../lib/util/collection.util';
import {store} from "../store";
import {loadBranches} from "@staticcms/core/actions/branches";
import {discardDraft, entriesClear} from "@staticcms/core/actions/entries";
import {authenticateUser} from "@staticcms/core/actions/auth";

import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import type {
  BaseField,
  Collection,
  CollectionFile,
  Config,
  Field,
  I18nInfo,
  LocalBackend,
  UnknownField,
} from '../interface';
import type { AppDispatch, RootState } from '../store';

function traverseFields(fields: Field[], updater: (field: Field) => Field): Field[] {
  return fields.map(field => {
    const newField = updater(field);
    if ('fields' in newField && newField.fields) {
      return { ...newField, fields: traverseFields(newField.fields, updater) } as Field;
    } else if (newField.widget === 'list' && newField.types) {
      return { ...newField, types: traverseFields(newField.types, updater) } as Field;
    }

    return newField as Field;
  });
}

function getConfigUrl() {
  const validTypes: { [type: string]: string } = {
    'text/yaml': 'yaml',
    'application/x-yaml': 'yaml',
  };
  const configLinkEl = document.querySelector<HTMLLinkElement>('link[rel="cms-config-url"]');
  if (configLinkEl && validTypes[configLinkEl.type] && configLinkEl.href) {
    console.info(`[StaticCMS] Using config file path: "${configLinkEl.href}"`);
    return configLinkEl.href;
  }

  return `${window.location.origin}${window.location.pathname.slice(
    0,
    window.location.pathname.lastIndexOf('/'),
  )}/config.yml`;
}

const setFieldDefaults =
  (collection: Collection, collectionFile?: CollectionFile) => (field: Field) => {
    if ('media_folder' in field && !('public_folder' in field)) {
      return { ...field, public_folder: field.media_folder };
    }

    if (field.widget === 'image' || field.widget === 'file' || field.widget === 'markdown') {
      field.media_library = {
        ...((collectionFile ?? collection).media_library ?? {}),
        ...(field.media_library ?? {}),
      };
    }

    return field;
  };

function setI18nField<T extends BaseField = UnknownField>(field: T) {
  if (field[I18N] === true) {
    return { ...field, [I18N]: I18N_FIELD_TRANSLATE };
  } else if (field[I18N] === false || !field[I18N]) {
    return { ...field, [I18N]: I18N_FIELD_NONE };
  }
  return field;
}

function getI18nDefaults(collectionOrFileI18n: boolean | I18nInfo, defaultI18n: I18nInfo) {
  if (typeof collectionOrFileI18n === 'boolean') {
    return defaultI18n;
  } else {
    const locales = collectionOrFileI18n.locales || defaultI18n.locales;
    const defaultLocale = collectionOrFileI18n.defaultLocale || locales[0];
    const mergedI18n: I18nInfo = deepmerge(defaultI18n, collectionOrFileI18n);
    mergedI18n.locales = locales;
    mergedI18n.defaultLocale = defaultLocale;
    throwOnMissingDefaultLocale(mergedI18n);
    return mergedI18n;
  }
}

function setI18nDefaultsForFields(collectionOrFileFields: Field[], hasI18n: boolean) {
  if (hasI18n) {
    return traverseFields(collectionOrFileFields, setI18nField);
  } else {
    return traverseFields(collectionOrFileFields, field => {
      const newField = { ...field };
      delete newField[I18N];
      return newField;
    });
  }
}

function throwOnInvalidFileCollectionStructure(i18n?: I18nInfo) {
  if (i18n && i18n.structure !== I18N_STRUCTURE_SINGLE_FILE) {
    throw new Error(
      `i18n configuration for files collections is limited to ${I18N_STRUCTURE_SINGLE_FILE} structure`,
    );
  }
}

function throwOnMissingDefaultLocale(i18n?: I18nInfo) {
  if (i18n && i18n.defaultLocale && !i18n.locales.includes(i18n.defaultLocale)) {
    throw new Error(
      `i18n locales '${i18n.locales.join(', ')}' are missing the default locale ${
        i18n.defaultLocale
      }`,
    );
  }
}

export function switchedBranch(branch: string) {
  return {type: BRANCH_SWITCH, branch} as const;
}

export function switchBranch(branch: string) {
  const dispatch: AppDispatch = store.dispatch;

  const url = new URL(window.location.href);
  url.searchParams.set('branch', branch);
  history.replaceState(null, '', url);

  const finishSwitch = () => {
    dispatch(switchedBranch(branch));
    dispatch(discardDraft());
    dispatch(entriesClear());
    dispatch(loadBranches() as unknown as AnyAction);
  };

  const loadConfigAction = loadConfig(undefined, function onLoad(config) {
    if (config.backend.name !== 'git-gateway') {
      dispatch(authenticateUser() as unknown as AnyAction);
    }
    finishSwitch();
  }) as AnyAction;

  // loadConfig() does return CONFIG_SUCCESS early if a programmatic config was provided,
  // ensure branch switch is still completed.
  dispatch(loadConfigAction);
  if (loadConfigAction.type === 'CONFIG_SUCCESS') {
    finishSwitch();
  }
}

export function applyDefaults<EF extends BaseField = UnknownField>(
  originalConfig: Config<EF>,
): Config<EF> {
  return produce(originalConfig, (config: Config) => {
    config.slug = config.slug || {};
    config.collections = config.collections || [];

    // Use `site_url` as default `display_url`.
    if (!config.display_url && config.site_url) {
      config.display_url = config.site_url;
    }

    // Use media_folder as default public_folder.
    const defaultPublicFolder = `/${trimStart(config.media_folder, '/')}`;
    if (!('public_folder' in config)) {
      config.public_folder = defaultPublicFolder;
    }

    // default values for the slug config
    if (!('encoding' in config.slug)) {
      config.slug.encoding = 'unicode';
    }

    if (!('clean_accents' in config.slug)) {
      config.slug.clean_accents = false;
    }

    if (!('sanitize_replacement' in config.slug)) {
      config.slug.sanitize_replacement = '-';
    }

    const i18n = config[I18N];

    if (i18n) {
      i18n.defaultLocale = i18n.defaultLocale || i18n.locales[0];
    }

    throwOnMissingDefaultLocale(i18n);

    const backend = resolveBackend(config);

    for (const collection of config.collections) {
      let collectionI18n = collection[I18N];

      if (config.editor && !collection.editor) {
        collection.editor = config.editor;
      }

      collection.media_library = {
        ...(config.media_library ?? {}),
        ...(collection.media_library ?? {}),
      };

      if (i18n && collectionI18n) {
        collectionI18n = getI18nDefaults(collectionI18n, i18n);
        collection[I18N] = collectionI18n;
      } else {
        collectionI18n = undefined;
        delete collection[I18N];
      }

      if ('fields' in collection && collection.fields) {
        collection.fields = setI18nDefaultsForFields(collection.fields, Boolean(collectionI18n));
      }

      const { view_filters, view_groups } = collection;

      if ('folder' in collection && collection.folder) {
        if (collection.path && !collection.media_folder) {
          // default value for media folder when using the path config
          collection.media_folder = '';
        }

        if ('media_folder' in collection && !('public_folder' in collection)) {
          collection.public_folder = collection.media_folder;
        }

        if ('fields' in collection && collection.fields) {
          collection.fields = traverseFields(collection.fields, setFieldDefaults(collection));
        }

        collection.folder = trim(collection.folder, '/');
      }

      if ('files' in collection && collection.files) {
        throwOnInvalidFileCollectionStructure(collectionI18n);

        for (const file of collection.files) {
          file.file = trimStart(file.file, '/');

          if ('media_folder' in file && !('public_folder' in file)) {
            file.public_folder = file.media_folder;
          }

          file.media_library = {
            ...(collection.media_library ?? {}),
            ...(file.media_library ?? {}),
          };

          if (file.fields) {
            file.fields = traverseFields(file.fields, setFieldDefaults(collection, file));
          }

          let fileI18n = file[I18N];

          if (fileI18n && collectionI18n) {
            fileI18n = getI18nDefaults(fileI18n, collectionI18n);
            file[I18N] = fileI18n;
          } else {
            fileI18n = undefined;
            delete file[I18N];
          }

          throwOnInvalidFileCollectionStructure(fileI18n);

          if (file.fields) {
            file.fields = setI18nDefaultsForFields(file.fields, Boolean(fileI18n));
          }

          if (collection.editor && !file.editor) {
            file.editor = collection.editor;
          }
        }
      }

      if (!collection.sortable_fields) {
        collection.sortable_fields = {
          fields: selectDefaultSortableFields(collection, backend),
        };
      }

      collection.view_filters = {
        default: collection.view_filters?.default,
        filters: (view_filters?.filters ?? []).map(filter => {
          return {
            ...filter,
            id: `${filter.field}__${filter.pattern}`,
          };
        }),
      };

      collection.view_groups = {
        default: collection.view_groups?.default,
        groups: (view_groups?.groups ?? []).map(group => {
          return {
            ...group,
            id: `${group.field}__${group.pattern}`,
          };
        }),
      };
    }

    if (config.backend.name === 'github') {
      const baseBranch = new URLSearchParams(window.location.search).get('branch');
      if (baseBranch) {
        config.backend.branch = baseBranch;
      }
    }
  });
}


export function parseConfig(data: string) {
  const config = yaml.parse(data, { maxAliasCount: -1, prettyErrors: true, merge: true });
  if (
    typeof window !== 'undefined' &&
    typeof window.CMS_ENV === 'string' &&
    config[window.CMS_ENV]
  ) {
    const configKeys = Object.keys(config[window.CMS_ENV]) as ReadonlyArray<keyof Config>;
    for (const key of configKeys) {
      config[key] = config[window.CMS_ENV][key] as Config[keyof Config];
    }
  }
  return config as Config;
}

async function getConfigYaml(file: string): Promise<Config> {
  const response = await fetch(file, { credentials: 'same-origin' }).catch(error => error as Error);
  if (response instanceof Error || response.status !== 200) {
    const message = response instanceof Error ? response.message : response.status;
    throw new Error(`Failed to load config.yml (${message})`);
  }
  const contentType = response.headers.get('Content-Type') ?? 'Not-Found';
  const isYaml = contentType.indexOf('yaml') !== -1;
  if (!isYaml) {
    console.info(`[StaticCMS] Response for ${file} was not yaml. (Content-Type: ${contentType})`);
  }
  return parseConfig(await response.text());
}

export function configLoaded(config: Config) {
  return {
    type: CONFIG_SUCCESS,
    payload: config,
  } as const;
}

export function configLoading() {
  return {
    type: CONFIG_REQUEST,
  } as const;
}

export function configFailed(err: Error) {
  return {
    type: CONFIG_FAILURE,
    error: 'Error loading config',
    payload: err,
  } as const;
}

export async function detectProxyServer(localBackend?: boolean | LocalBackend) {
  const allowedHosts = [
    'localhost',
    '127.0.0.1',
    ...(typeof localBackend === 'boolean' ? [] : localBackend?.allowed_hosts || []),
  ];

  if (!allowedHosts.includes(location.hostname) || !localBackend) {
    return {};
  }

  const defaultUrl = 'http://localhost:8081/api/v1';
  const proxyUrl =
    localBackend === true
      ? defaultUrl
      : localBackend.url || defaultUrl.replace('localhost', location.hostname);

  try {
    console.info(`[StaticCMS] Looking for Static CMS Proxy Server at '${proxyUrl}'`);
    const res = await fetch(`${proxyUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'info' }),
    });
    const { repo, type } = (await res.json()) as {
      repo?: string;
      type?: string;
    };
    if (typeof repo === 'string' && typeof type === 'string') {
      console.info(
        `[StaticCMS] Detected Static CMS Proxy Server at '${proxyUrl}' with repo: '${repo}'`,
      );
      return { proxyUrl, type };
    } else {
      console.info(`[StaticCMS] Static CMS Proxy Server not detected at '${proxyUrl}'`);
      return {};
    }
  } catch {
    console.info(`[StaticCMS] Static CMS Proxy Server not detected at '${proxyUrl}'`);
    return {};
  }
}

export async function handleLocalBackend(originalConfig: Config) {
  if (!originalConfig.local_backend) {
    return originalConfig;
  }

  const { proxyUrl } = await detectProxyServer(originalConfig.local_backend);

  if (!proxyUrl) {
    return originalConfig;
  }

  return produce(originalConfig, config => {
    config.backend.name = 'proxy';
    config.backend.proxy_url = proxyUrl;
  });
}

export function loadConfig(manualConfig: Config | undefined, onLoad: (config: Config) => unknown) {
  if (window.CMS_CONFIG) {
    return configLoaded(window.CMS_CONFIG);
  }
  return async (dispatch: ThunkDispatch<RootState, {}, AnyAction>) => {
    dispatch(configLoading());

    try {
      const configUrl = getConfigUrl();
      const mergedConfig = manualConfig ? manualConfig : await getConfigYaml(configUrl);

      validateConfig(mergedConfig);

      const withLocalBackend = await handleLocalBackend(mergedConfig);
      const config = applyDefaults(withLocalBackend);

      dispatch(configLoaded(config));

      if (typeof onLoad === 'function') {
        onLoad(config);
      }
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        dispatch(configFailed(error));
      }
      throw error;
    }
  };
}

export type ConfigAction = ReturnType<
  typeof switchedBranch | typeof configLoading | typeof configLoaded | typeof configFailed
>;
