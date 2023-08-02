import isEqual from 'lodash/isEqual';

import { currentBackend } from '../backend';
import {
  ADD_DRAFT_ENTRY_MEDIA_FILE,
  CHANGE_VIEW_STYLE,
  DRAFT_UPDATE,
  DRAFT_CHANGE_FIELD,
  DRAFT_CREATE_DUPLICATE_FROM_ENTRY,
  DRAFT_CREATE_EMPTY,
  DRAFT_CREATE_FROM_ENTRY,
  DRAFT_CREATE_FROM_LOCAL_BACKUP,
  DRAFT_DISCARD,
  DRAFT_LOCAL_BACKUP_DELETE,
  DRAFT_LOCAL_BACKUP_RETRIEVED,
  DRAFT_VALIDATION_ERRORS,
  ENTRIES_FAILURE,
  ENTRIES_REQUEST,
  ENTRIES_SUCCESS,
  ENTRY_DELETE_FAILURE,
  ENTRY_DELETE_REQUEST,
  ENTRY_DELETE_SUCCESS,
  ENTRY_FAILURE,
  ENTRY_PERSIST_FAILURE,
  ENTRY_PERSIST_REQUEST,
  ENTRY_PERSIST_SUCCESS,
  ENTRY_REQUEST,
  ENTRY_SUCCESS,
  FILTER_ENTRIES_FAILURE,
  FILTER_ENTRIES_REQUEST,
  FILTER_ENTRIES_SUCCESS,
  GROUP_ENTRIES_FAILURE,
  GROUP_ENTRIES_REQUEST,
  GROUP_ENTRIES_SUCCESS,
  REMOVE_DRAFT_ENTRY_MEDIA_FILE,
  SORT_DIRECTION_ASCENDING,
  SORT_ENTRIES_FAILURE,
  SORT_ENTRIES_REQUEST,
  SORT_ENTRIES_SUCCESS, ENTRIES_CLEAR,
} from '../constants';
import ValidationErrorTypes from '../constants/validationErrorTypes';
import {
  I18N_FIELD_DUPLICATE,
  I18N_FIELD_TRANSLATE,
  duplicateDefaultI18nFields,
  hasI18n,
  serializeI18n,
} from '../lib/i18n';
import { serializeValues } from '../lib/serializeEntryValues';
import { Cursor } from '../lib/util';
import { selectFields, updateFieldByKey } from '../lib/util/collection.util';
import { selectCollectionEntriesCursor } from '../reducers/selectors/cursors';
import {
  selectEntriesSortField,
  selectIsFetching,
  selectPublishedSlugs,
} from '../reducers/selectors/entries';
import { addSnackbar } from '../store/slices/snackbars';
import { createAssetProxy } from '../valueObjects/AssetProxy';
import createEntry from '../valueObjects/createEntry';
import { addAssets, getAsset } from './media';
import { loadMedia } from './mediaLibrary';
import { waitUntil } from './waitUntil';

import type { NavigateFunction } from 'react-router-dom';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import type { Backend } from '../backend';
import type { ViewStyle } from '../constants/views';
import type {
  Collection,
  Entry,
  EntryData,
  EntryDraft,
  Field,
  FieldError,
  I18nSettings,
  ImplementationMediaFile,
  ObjectValue,
  SortDirection,
  ValueOrNestedValue,
  ViewFilter,
  ViewGroup,
} from '../interface';
import type { RootState } from '../store';
import type AssetProxy from '../valueObjects/AssetProxy';

/*
 * Simple Action Creators (Internal)
 * We still need to export them for tests
 */
export function entryLoading(collection: Collection, slug: string) {
  return {
    type: ENTRY_REQUEST,
    payload: {
      collection: collection.name,
      slug,
    },
  } as const;
}

export function entryLoaded(collection: Collection, entry: Entry) {
  return {
    type: ENTRY_SUCCESS,
    payload: {
      collection: collection.name,
      entry,
    },
  } as const;
}

export function entryLoadError(error: Error, collection: Collection, slug: string) {
  return {
    type: ENTRY_FAILURE,
    payload: {
      error,
      collection: collection.name,
      slug,
    },
  } as const;
}

export function entriesLoading(collection: Collection) {
  return {
    type: ENTRIES_REQUEST,
    payload: {
      collection: collection.name,
    },
  } as const;
}

export function filterEntriesRequest(collection: Collection, filter: ViewFilter) {
  return {
    type: FILTER_ENTRIES_REQUEST,
    payload: {
      collection: collection.name,
      filter,
    },
  } as const;
}

export function filterEntriesSuccess(collection: Collection, filter: ViewFilter, entries: Entry[]) {
  return {
    type: FILTER_ENTRIES_SUCCESS,
    payload: {
      collection: collection.name,
      filter,
      entries,
    },
  } as const;
}

export function filterEntriesFailure(collection: Collection, filter: ViewFilter, error: unknown) {
  return {
    type: FILTER_ENTRIES_FAILURE,
    payload: {
      collection: collection.name,
      filter,
      error,
    },
  } as const;
}

export function groupEntriesRequest(collection: Collection, group: ViewGroup) {
  return {
    type: GROUP_ENTRIES_REQUEST,
    payload: {
      collection: collection.name,
      group,
    },
  } as const;
}

export function groupEntriesSuccess(collection: Collection, group: ViewGroup, entries: Entry[]) {
  return {
    type: GROUP_ENTRIES_SUCCESS,
    payload: {
      collection: collection.name,
      group,
      entries,
    },
  } as const;
}

export function groupEntriesFailure(collection: Collection, group: ViewGroup, error: unknown) {
  return {
    type: GROUP_ENTRIES_FAILURE,
    payload: {
      collection: collection.name,
      group,
      error,
    },
  } as const;
}

export function sortEntriesRequest(collection: Collection, key: string, direction: SortDirection) {
  return {
    type: SORT_ENTRIES_REQUEST,
    payload: {
      collection: collection.name,
      key,
      direction,
    },
  } as const;
}

export function sortEntriesSuccess(
  collection: Collection,
  key: string,
  direction: SortDirection,
  entries: Entry[],
) {
  return {
    type: SORT_ENTRIES_SUCCESS,
    payload: {
      collection: collection.name,
      key,
      direction,
      entries,
    },
  } as const;
}

export function sortEntriesFailure(
  collection: Collection,
  key: string,
  direction: SortDirection,
  error: unknown,
) {
  return {
    type: SORT_ENTRIES_FAILURE,
    payload: {
      collection: collection.name,
      key,
      direction,
      error,
    },
  } as const;
}

export function entriesLoaded(
  collection: Collection,
  entries: Entry[],
  pagination: number | null,
  cursor: Cursor,
  append = true,
) {
  return {
    type: ENTRIES_SUCCESS,
    payload: {
      collection: collection.name,
      entries,
      page: pagination,
      cursor: Cursor.create(cursor),
      append,
    },
  } as const;
}

export function entriesFailed(collection: Collection, error: Error) {
  return {
    type: ENTRIES_FAILURE,
    error: 'Failed to load entries',
    meta: {
      collection: collection.name,
    },
    payload: error.toString(),
  } as const;
}

export function entriesClear() {
  return { type: ENTRIES_CLEAR } as const;
}

async function getAllEntries(state: RootState, collection: Collection) {
  const configState = state.config;
  if (!configState.config) {
    throw new Error('Config not loaded');
  }

  const backend = currentBackend(configState.config);
  return backend.listAllEntries(collection);
}

export function sortByField(
  collection: Collection,
  key: string,
  direction: SortDirection = SORT_DIRECTION_ASCENDING,
) {
  return async (dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    const state = getState();
    // if we're already fetching we update the sort key, but skip loading entries
    const isFetching = selectIsFetching(state, collection.name);
    dispatch(sortEntriesRequest(collection, key, direction));
    if (isFetching) {
      return;
    }

    try {
      const entries = await getAllEntries(state, collection);
      dispatch(sortEntriesSuccess(collection, key, direction, entries));
    } catch (error) {
      console.error(error);
      dispatch(sortEntriesFailure(collection, key, direction, error));
    }
  };
}

export function filterByField(collection: Collection, filter: ViewFilter) {
  return async (dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    const state = getState();
    // if we're already fetching we update the filter key, but skip loading entries
    const isFetching = selectIsFetching(state, collection.name);
    dispatch(filterEntriesRequest(collection, filter));
    if (isFetching) {
      return;
    }

    try {
      const entries = await getAllEntries(state, collection);
      dispatch(filterEntriesSuccess(collection, filter, entries));
    } catch (error) {
      dispatch(filterEntriesFailure(collection, filter, error));
    }
  };
}

export function groupByField(collection: Collection, group: ViewGroup) {
  return async (dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    const state = getState();
    const isFetching = selectIsFetching(state, collection.name);
    dispatch({
      type: GROUP_ENTRIES_REQUEST,
      payload: {
        collection: collection.name,
        group,
      },
    });
    if (isFetching) {
      return;
    }

    try {
      const entries = await getAllEntries(state, collection);
      dispatch(groupEntriesSuccess(collection, group, entries));
    } catch (error) {
      dispatch({
        type: GROUP_ENTRIES_FAILURE,
        payload: {
          collection: collection.name,
          group,
          error,
        },
      });
    }
  };
}

export function changeViewStyle(viewStyle: ViewStyle) {
  return {
    type: CHANGE_VIEW_STYLE,
    payload: {
      style: viewStyle,
    },
  } as const;
}

export function entryPersisting(collection: Collection, entry: Entry) {
  return {
    type: ENTRY_PERSIST_REQUEST,
    payload: {
      collectionName: collection.name,
      entrySlug: entry.slug,
    },
  } as const;
}

export function entryPersisted(collection: Collection, entry: Entry, slug: string) {
  return {
    type: ENTRY_PERSIST_SUCCESS,
    payload: {
      collectionName: collection.name,
      entrySlug: entry.slug,

      /**
       * Pass slug from backend for newly created entries.
       */
      slug,
    },
  } as const;
}

export function entryPersistFail(collection: Collection, entry: Entry, error: Error) {
  return {
    type: ENTRY_PERSIST_FAILURE,
    error: 'Failed to persist entry',
    payload: {
      collectionName: collection.name,
      entrySlug: entry.slug,
      error: error.toString(),
    },
  } as const;
}

export function entryDeleting(collection: Collection, slug: string) {
  return {
    type: ENTRY_DELETE_REQUEST,
    payload: {
      collectionName: collection.name,
      entrySlug: slug,
    },
  } as const;
}

export function entryDeleted(collection: Collection, slug: string) {
  return {
    type: ENTRY_DELETE_SUCCESS,
    payload: {
      collectionName: collection.name,
      entrySlug: slug,
    },
  } as const;
}

export function entryDeleteFail(collection: Collection, slug: string, error: Error) {
  return {
    type: ENTRY_DELETE_FAILURE,
    payload: {
      collectionName: collection.name,
      entrySlug: slug,
      error: error.toString(),
    },
  } as const;
}

export function emptyDraftCreated(entry: Entry) {
  return {
    type: DRAFT_CREATE_EMPTY,
    payload: entry,
  } as const;
}
/*
 * Exported simple Action Creators
 */
export function createDraftFromEntry(entry: Entry) {
  return {
    type: DRAFT_CREATE_FROM_ENTRY,
    payload: { entry },
  } as const;
}

export function draftDuplicateEntry(entry: Entry) {
  return {
    type: DRAFT_CREATE_DUPLICATE_FROM_ENTRY,
    payload: createEntry(entry.collection, '', '', {
      data: entry.data,
      mediaFiles: entry.mediaFiles,
    }),
  } as const;
}

export function discardDraft() {
  return { type: DRAFT_DISCARD } as const;
}

export function updateDraft({ data }: { data: EntryData }) {
  return {
    type: DRAFT_UPDATE,
    payload: { data },
  } as const;
}

export function changeDraftField({
  path,
  field,
  value,
  i18n,
  isMeta,
}: {
  path: string;
  field: Field;
  value: ValueOrNestedValue;
  i18n?: I18nSettings;
  isMeta: boolean;
}) {
  return {
    type: DRAFT_CHANGE_FIELD,
    payload: { path, field, value, i18n, isMeta },
  } as const;
}

export function changeDraftFieldValidation(
  path: string,
  errors: FieldError[],
  i18n?: I18nSettings,
  isMeta?: boolean,
) {
  return {
    type: DRAFT_VALIDATION_ERRORS,
    payload: { path, errors, i18n, isMeta },
  } as const;
}

export function localBackupRetrieved(entry: Entry) {
  return {
    type: DRAFT_LOCAL_BACKUP_RETRIEVED,
    payload: { entry },
  } as const;
}

export function loadLocalBackup() {
  return {
    type: DRAFT_CREATE_FROM_LOCAL_BACKUP,
  } as const;
}

export function deleteDraftLocalBackup() {
  return {
    type: DRAFT_LOCAL_BACKUP_DELETE,
  } as const;
}

export function addDraftEntryMediaFile(file: ImplementationMediaFile) {
  return { type: ADD_DRAFT_ENTRY_MEDIA_FILE, payload: file } as const;
}

export function removeDraftEntryMediaFile({ id }: { id: string }) {
  return { type: REMOVE_DRAFT_ENTRY_MEDIA_FILE, payload: { id } } as const;
}

export function persistLocalBackup(entry: Entry, collection: Collection) {
  return (_dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    const state = getState();
    const configState = state.config;
    if (!configState.config) {
      throw new Error('Config not loaded');
    }

    const backend = currentBackend(configState.config);

    return backend.persistLocalDraftBackup(entry, collection);
  };
}

export function createDraftDuplicateFromEntry(entry: Entry) {
  return (dispatch: ThunkDispatch<RootState, {}, AnyAction>) => {
    dispatch(
      waitUntil({
        predicate: ({ type }) => type === DRAFT_CREATE_EMPTY,
        run: () => dispatch(draftDuplicateEntry(entry)),
      }),
    );
  };
}

export function retrieveLocalBackup(collection: Collection, slug: string) {
  return async (dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    const state = getState();
    const configState = state.config;
    if (!configState.config) {
      throw new Error('Config not loaded');
    }

    const backend = currentBackend(configState.config);
    const { entry } = await backend.getLocalDraftBackup(collection, slug);

    if (entry) {
      // load assets from backup
      const mediaFiles = entry.mediaFiles || [];
      const assetProxies: AssetProxy[] = await Promise.all(
        mediaFiles
          .filter(file => !file.isDirectory)
          .map(file => {
            if (file.file || file.url) {
              return createAssetProxy({
                path: file.path,
                file: file.file,
                url: file.url,
                field: file.field,
              });
            } else {
              return getAsset(collection, entry, file.path, file.field)(dispatch, getState);
            }
          }),
      );
      dispatch(addAssets(assetProxies));

      return dispatch(localBackupRetrieved(entry));
    }
  };
}

export function deleteLocalBackup(collection: Collection, slug: string) {
  return (_dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    const state = getState();
    const configState = state.config;
    if (!configState.config) {
      throw new Error('Config not loaded');
    }

    const backend = currentBackend(configState.config);
    return backend.deleteLocalDraftBackup(collection, slug);
  };
}

/*
 * Exported Thunk Action Creators
 */

export function loadEntry(collection: Collection, slug: string, silent = false) {
  return async (dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    if (!silent) {
      dispatch(entryLoading(collection, slug));
    }

    try {
      await dispatch(loadMedia());
      const loadedEntry = await tryLoadEntry(getState(), collection, slug);
      dispatch(entryLoaded(collection, loadedEntry));
      dispatch(createDraftFromEntry(loadedEntry));
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        dispatch(
          addSnackbar({
            type: 'error',
            message: {
              key: 'ui.toast.onFailToLoadEntries',
              options: {
                details: error.message,
              },
            },
          }),
        );
        dispatch(entryLoadError(error, collection, slug));
      }
    }
  };
}

export async function tryLoadEntry(state: RootState, collection: Collection, slug: string) {
  const configState = state.config;
  if (!configState.config) {
    throw new Error('Config not loaded');
  }

  const backend = currentBackend(configState.config);
  return backend.getEntry(state, collection, slug);
}

interface AppendAction {
  action: string;
  append: boolean;
}

const appendActions = {
  append_next: { action: 'next', append: true },
} as Record<string, AppendAction>;

function addAppendActionsToCursor(cursor: Cursor) {
  return Cursor.create(cursor).updateStore(store => ({
    ...store,
    actions: new Set([
      ...store.actions,
      ...(Object.entries(appendActions)
        .filter(([_k, v]) => store.actions.has(v.action as string))
        .map(([k, _v]) => k) as string[]),
    ]),
  }));
}

export function loadEntries(collection: Collection, page = 0) {
  return async (dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    if (collection.isFetching) {
      return;
    }
    const state = getState();
    const sortField = selectEntriesSortField(collection.name)(state);
    if (sortField) {
      return dispatch(sortByField(collection, sortField.key, sortField.direction));
    }

    const configState = state.config;
    if (!configState.config) {
      throw new Error('Config not loaded');
    }

    const backend = currentBackend(configState.config);

    const loadAllEntries = 'nested' in collection || hasI18n(collection);
    const append = !!(page && !isNaN(page) && page > 0) && !loadAllEntries;
    dispatch(entriesLoading(collection));

    try {
      const response: {
        cursor?: Cursor;
        pagination?: number;
        entries: Entry[];
      } = await (loadAllEntries
        ? // nested collections require all entries to construct the tree
          backend.listAllEntries(collection).then((entries: Entry[]) => ({ entries }))
        : backend.listEntries(collection));

      const cleanResponse = {
        ...response,
        cursor: !('cursor' in response && response.cursor)
          ? Cursor.create({
              actions: ['next'],
              meta: { usingOldPaginationAPI: true },
              data: { nextPage: loadAllEntries ? -1 : page + 1 },
            })
          : Cursor.create(response.cursor),
      };

      dispatch(
        entriesLoaded(
          collection,
          cleanResponse.cursor.meta.usingOldPaginationAPI
            ? response.entries.reverse()
            : response.entries,
          response.pagination ?? 1,
          addAppendActionsToCursor(cleanResponse.cursor),
          append,
        ),
      );
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        dispatch(
          addSnackbar({
            type: 'error',
            message: {
              key: 'ui.toast.onFailToLoadEntries',
              options: {
                details: error.message,
              },
            },
          }),
        );
        return Promise.reject(dispatch(entriesFailed(collection, error)));
      }

      return Promise.reject();
    }
  };
}

function traverseCursor(backend: Backend, cursor: Cursor, action: string) {
  if (!cursor.actions!.has(action)) {
    throw new Error(`The current cursor does not support the pagination action "${action}".`);
  }
  return backend.traverseCursor(cursor, action);
}

export function traverseCollectionCursor(collection: Collection, action: string) {
  return async (dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    const state = getState();
    const collectionName = collection.name;
    if (state.entries.pages?.[collectionName]?.isFetching) {
      return;
    }

    const configState = state.config;
    if (!configState.config) {
      throw new Error('Config not loaded');
    }

    const backend = currentBackend(configState.config);

    const { action: realAction, append } =
      action in appendActions ? appendActions[action] : { action, append: false };
    const cursor = selectCollectionEntriesCursor(state, collection.name);

    // Handle cursors representing pages in the old, integer-based pagination API
    if (cursor.meta?.usingOldPaginationAPI ?? false) {
      const nextPage = (cursor.data!.nextPage as number) ?? -1;
      if (nextPage < 0) {
        return;
      }

      return dispatch(loadEntries(collection, nextPage));
    }

    try {
      dispatch(entriesLoading(collection));
      const { entries, cursor: newCursor } = await traverseCursor(backend, cursor, realAction);

      const pagination = newCursor.meta?.page as number | null;
      return dispatch(
        entriesLoaded(collection, entries, pagination, addAppendActionsToCursor(newCursor), append),
      );
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        dispatch(
          addSnackbar({
            type: 'error',
            message: {
              key: 'ui.toast.onFailToLoadEntries',
              options: {
                details: error.message,
              },
            },
          }),
        );
        return Promise.reject(dispatch(entriesFailed(collection, error)));
      }

      return Promise.reject();
    }
  };
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function processValue(unsafe: string) {
  if (['true', 'True', 'TRUE'].includes(unsafe)) {
    return true;
  }
  if (['false', 'False', 'FALSE'].includes(unsafe)) {
    return false;
  }

  return escapeHtml(unsafe);
}

export function createEmptyDraft(collection: Collection, search: string) {
  return async (dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    if ('files' in collection) {
      return;
    }

    const params = new URLSearchParams(search);
    params.forEach((value, key) => {
      collection = updateFieldByKey(collection, key, field => {
        if ('default' in field) {
          field.default = processValue(value);
        }
        return field;
      });
    });

    const fields = collection.fields ?? [];
    const data = createEmptyDraftData(fields);

    const state = getState();
    const configState = state.config;
    if (!configState.config) {
      throw new Error('Config not loaded');
    }

    const backend = currentBackend(configState.config);

    const i18nFields = createEmptyDraftI18nData(collection, fields);

    let newEntry = createEntry(collection.name, '', '', {
      data,
      i18n: i18nFields,
      mediaFiles: [],
    });
    newEntry = await backend.processEntry(state, collection, newEntry);
    dispatch(emptyDraftCreated(newEntry));
  };
}

export function createEmptyDraftData(
  fields: Field[],
  skipField: (field: Field) => boolean = () => false,
) {
  const ddd = fields.reduce((acc, item) => {
    if (skipField(item)) {
      return acc;
    }

    const subfields = 'fields' in item && item.fields;
    const list = item.widget === 'list';
    const name = item.name;
    const defaultValue = (('default' in item ? item.default : null) ?? null) as EntryData;

    function isEmptyDefaultValue(val: EntryData | EntryData[]) {
      return [[{}], {}].some(e => isEqual(val, e));
    }

    if (subfields) {
      if (list && Array.isArray(defaultValue)) {
        acc[name] = defaultValue;
      } else {
        const asList = Array.isArray(subfields) ? subfields : [subfields];

        const subDefaultValue = list
          ? [createEmptyDraftData(asList, skipField)]
          : createEmptyDraftData(asList, skipField);

        if (!isEmptyDefaultValue(subDefaultValue)) {
          acc[name] = subDefaultValue;
        }
      }
      return acc;
    }

    if (defaultValue !== null) {
      acc[name] = defaultValue;
    }

    return acc;
  }, {} as ObjectValue);

  return ddd;
}

function createEmptyDraftI18nData(collection: Collection, dataFields: Field[]) {
  if (!hasI18n(collection)) {
    return {};
  }

  function skipField(field: Field) {
    return field.i18n !== I18N_FIELD_DUPLICATE && field.i18n !== I18N_FIELD_TRANSLATE;
  }

  const i18nData = createEmptyDraftData(dataFields, skipField);
  return duplicateDefaultI18nFields(collection, i18nData);
}

export function getMediaAssets({ entry }: { entry: Entry }) {
  const filesArray = entry.mediaFiles;
  const assets = filesArray
    .filter(file => file.draft)
    .map(file =>
      createAssetProxy({
        path: file.path,
        file: file.file,
        url: file.url,
        field: file.field,
      }),
    );

  return assets;
}

export function getSerializedEntry(collection: Collection, entry: Entry): Entry {
  /**
   * Serialize the values of any fields with registered serializers, and
   * update the entry and entryDraft with the serialized values.
   */
  const fields = selectFields(collection, entry.slug);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function serializeData(data: any) {
    return serializeValues(data, fields);
  }

  let serializedEntry: Entry = {
    ...entry,
    data: serializeData(entry.data),
  };

  if (hasI18n(collection)) {
    serializedEntry = serializeI18n(collection, serializedEntry, serializeData);
  }

  return serializedEntry;
}

export function persistEntry(
  collection: Collection,
  rootSlug: string | undefined,
  navigate: NavigateFunction,
) {
  return async (dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    const state = getState();
    const entryDraft = state.entryDraft;
    const fieldsErrors = entryDraft.fieldsErrors;
    const usedSlugs = selectPublishedSlugs(collection.name)(state);

    // Early return if draft contains validation errors
    if (Object.keys(fieldsErrors).length > 0) {
      const hasPresenceErrors = Object.values(fieldsErrors).find(errors =>
        errors.some(error => error.type && error.type === ValidationErrorTypes.PRESENCE),
      );

      if (hasPresenceErrors) {
        dispatch(
          addSnackbar({
            type: 'error',
            message: {
              key: 'ui.toast.missingRequiredField',
            },
          }),
        );
      } else {
        const firstErrorMessage = Object.values(fieldsErrors).flatMap(errors =>
          errors.map(error => error.message),
        )[0];

        if (firstErrorMessage) {
          dispatch(
            addSnackbar({
              type: 'error',
              message: firstErrorMessage,
            }),
          );
        }
      }

      return Promise.reject();
    }

    const configState = state.config;
    if (!configState.config) {
      throw new Error('Config not loaded');
    }

    const backend = currentBackend(configState.config);
    const entry = entryDraft.entry;
    if (!entry) {
      return Promise.reject();
    }

    const assetProxies = getMediaAssets({
      entry,
    });

    const serializedEntry = getSerializedEntry(collection, entry);
    const newEntryDraft: EntryDraft = {
      ...(entryDraft as EntryDraft),
      entry: serializedEntry,
    };
    dispatch(entryPersisting(collection, serializedEntry));
    return backend
      .persistEntry({
        config: configState.config,
        rootSlug,
        collection,
        entryDraft: newEntryDraft,
        assetProxies,
        usedSlugs,
      })
      .then(async (newSlug: string) => {
        dispatch(
          addSnackbar({
            type: 'success',
            message: {
              key: 'ui.toast.entrySaved',
            },
          }),
        );

        // re-load media library if entry had media files
        if (assetProxies.length > 0) {
          await dispatch(loadMedia());
        }
        dispatch(entryPersisted(collection, serializedEntry, newSlug));
        if ('nested' in collection) {
          await dispatch(loadEntries(collection));
        }
        if (entry.slug !== newSlug) {
          await dispatch(loadEntry(collection, newSlug));
          navigate(`/collections/${collection.name}/entries/${newSlug}`);
        } else {
          await dispatch(loadEntry(collection, newSlug, true));
        }
      })
      .catch((error: Error) => {
        console.error(error);
        dispatch(
          addSnackbar({
            type: 'error',
            message: {
              key: 'ui.toast.onFailToPersist',
              options: {
                details: error,
              },
            },
          }),
        );
        return Promise.reject(dispatch(entryPersistFail(collection, serializedEntry, error)));
      });
  };
}

export function deleteEntry(collection: Collection, slug: string) {
  return (dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    const state = getState();
    const configState = state.config;
    if (!configState.config) {
      throw new Error('Config not loaded');
    }

    const backend = currentBackend(configState.config);

    dispatch(entryDeleting(collection, slug));
    return backend
      .deleteEntry(state, collection, slug)
      .then(() => {
        return dispatch(entryDeleted(collection, slug));
      })
      .catch((error: Error) => {
        dispatch(
          addSnackbar({
            type: 'error',
            message: {
              key: 'ui.toast.onFailToDelete',
              options: {
                details: error,
              },
            },
          }),
        );
        console.error(error);
        return Promise.reject(dispatch(entryDeleteFail(collection, slug, error)));
      });
  };
}

export type EntriesAction = ReturnType<
  | typeof entryLoading
  | typeof entryLoaded
  | typeof entryLoadError
  | typeof entriesLoading
  | typeof entriesLoaded
  | typeof entriesFailed
  | typeof entriesClear
  | typeof changeViewStyle
  | typeof entryPersisting
  | typeof entryPersisted
  | typeof entryPersistFail
  | typeof entryDeleting
  | typeof entryDeleted
  | typeof entryDeleteFail
  | typeof emptyDraftCreated
  | typeof createDraftFromEntry
  | typeof draftDuplicateEntry
  | typeof discardDraft
  | typeof updateDraft
  | typeof changeDraftField
  | typeof changeDraftFieldValidation
  | typeof localBackupRetrieved
  | typeof loadLocalBackup
  | typeof deleteDraftLocalBackup
  | typeof addDraftEntryMediaFile
  | typeof removeDraftEntryMediaFile
  | typeof filterEntriesRequest
  | typeof filterEntriesSuccess
  | typeof filterEntriesFailure
  | typeof groupEntriesRequest
  | typeof groupEntriesSuccess
  | typeof groupEntriesFailure
  | typeof sortEntriesRequest
  | typeof sortEntriesSuccess
  | typeof sortEntriesFailure
>;
