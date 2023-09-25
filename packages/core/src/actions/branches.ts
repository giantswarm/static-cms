import {GitHubBackend} from "@staticcms/core";

import {LOAD_BRANCHES_FAILURE, LOAD_BRANCHES_REQUEST, LOAD_BRANCHES_SUCCESS} from '../constants';
import {currentBackend} from "@staticcms/core/backend";

import type GitHub from "@staticcms/core/backends/github/implementation";
import type {ThunkDispatch} from "redux-thunk";
import type {RootState} from "@staticcms/core/store";
import type {AnyAction} from "redux";
import type {Branch} from "@staticcms/core/reducers/branches";


export function branchesLoaded(branches: Branch[]) {
  return {
    type: LOAD_BRANCHES_SUCCESS,
    payload: branches,
  } as const;
}

export function branchesLoading() {
  return {
    type: LOAD_BRANCHES_REQUEST,
  } as const;
}

export function branchesFailed(err: Error) {
  return {
    type: LOAD_BRANCHES_FAILURE,
    error: 'Error loading branches',
    payload: err,
  } as const;
}


export function loadBranches() {
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

    const gitHubBackend = (backend.implementation as GitHub);

    dispatch(branchesLoading());
    try {
      const branches = await gitHubBackend.getBranches()
      dispatch(branchesLoaded(branches));
    } catch(error) {
      console.error(error);
      dispatch(branchesFailed(error as Error));
    }
  }
}

export type BranchesAction = ReturnType<
  typeof branchesLoaded | typeof branchesLoading | typeof branchesFailed
>;
