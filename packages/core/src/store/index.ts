import { configureStore } from '@reduxjs/toolkit';

import createRootReducer from '../reducers/combinedReducer';
import { waitUntilAction } from './middleware/waitUntilAction';

import type { BaseField, UnknownField } from '../interface';
import type { CollectionsState } from '../reducers/collections';
import type { ConfigState } from '../reducers/config';
import type { BranchesState } from '@staticcms/core/reducers/branches';
import type { ThunkDispatch } from 'redux-thunk';
import type { AnyAction } from 'redux';
import type { PullsState } from "@staticcms/core/reducers/pulls";

const store = configureStore({
  reducer: createRootReducer(),
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(waitUntilAction),
});

export { store };
export type RootState<EF extends BaseField = UnknownField> = Omit<
  ReturnType<typeof store.getState>,
  'collection' | 'config' | 'branches' | 'pulls'
> & {
  collection: CollectionsState<EF>;
  config: ConfigState<EF>;
  branches: BranchesState;
  pulls: PullsState;
};
export type AppStore = typeof store;
export type AppDispatch = ThunkDispatch<RootState, any, AnyAction>;
