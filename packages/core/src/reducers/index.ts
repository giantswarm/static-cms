import auth from './auth';
import collections from './collections';
import config from './config';
import cursors from './cursors';
import entries from './entries';
import entryDraft from './entryDraft';
import globalUI from './globalUI';
import mediaLibrary from './mediaLibrary';
import medias from './medias';
import scroll from './scroll';
import search from './search';
import status from './status';
import branches from './branches';
import pulls from './pulls';

const reducers = {
  auth,
  collections,
  config,
  branches,
  pulls,
  cursors,
  entries,
  entryDraft,
  globalUI,
  mediaLibrary,
  medias,
  scroll,
  search,
  status,
};

export default reducers;
