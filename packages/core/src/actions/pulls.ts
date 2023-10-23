import { GitHubBackend } from '@staticcms/core';
import { LOAD_PULLS_FAILURE, LOAD_PULLS_REQUEST, LOAD_PULLS_SUCCESS } from '../constants';
import { currentBackend } from '@staticcms/core/backend';

import type { PullRequestLike } from '@staticcms/core';
import type { ThunkDispatch } from 'redux-thunk';
import type { RootState } from '@staticcms/core/store';
import type { AnyAction } from 'redux';

export function pullsLoaded(pulls: PullRequestLike[]) {
  return {
    type: LOAD_PULLS_SUCCESS,
    payload: pulls,
  } as const;
}

export function pullsLoading() {
  return {
    type: LOAD_PULLS_REQUEST,
  } as const;
}

export function pullsFailed(err: Error) {
  return {
    type: LOAD_PULLS_FAILURE,
    error: 'Error loading pull request like things',
    payload: err,
  } as const;
}

export function loadPulls() {
  return async (dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    const state = getState();
    const config = state.config.config;

    if (!config) {
      return;
    }

    const backend = currentBackend(config);
    if (!(backend.implementation instanceof GitHubBackend)) {
      return;
    }

    const gitHubBackend = backend.implementation;

    dispatch(pullsLoading());
    try {
      const pulls = await gitHubBackend.getPulls();
      dispatch(pullsLoaded(pulls));
    } catch (error) {
      console.error(error);
      dispatch(pullsFailed(error as Error));
    }
  };
}

export type PullsAction = ReturnType<
  typeof pullsLoaded | typeof pullsLoading | typeof pullsFailed
>;
