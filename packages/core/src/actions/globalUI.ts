/* eslint-disable import/prefer-default-export */
import {PULL_OPENED, THEME_CHANGE} from '../constants';
import {currentBackend} from "@staticcms/core/backend";

import type {ThunkDispatch} from "redux-thunk";
import type {RootState} from "@staticcms/core/store";
import type {AnyAction} from "redux";
import type {PullRequestLike} from "@staticcms/core";

export function changeTheme(theme: string) {
  return { type: THEME_CHANGE, payload: theme } as const;
}

export function pullOpened(pull: PullRequestLike) {
  return { type: PULL_OPENED, payload: pull } as const;
}

export function openPullInNewTab(branch: string) {
  return async (dispatch: ThunkDispatch<RootState, {}, AnyAction>, getState: () => RootState) => {
    const state = getState();
    if (!state.config.config) {
      return;
    }

    const backend = currentBackend(state.config.config);
    try {
      const pulls = await backend.listPulls();
      for (const pull of pulls) {
        if (pull.branch === branch) {
          const url = pull.html_url;
          const win = window.open(url, '_blank');
          if (win) {
            win.focus();
          }
          dispatch(pullOpened(pull));
        }
      }
    } catch (error: unknown) {
      console.error(error);
    }
  };
}

export type GlobalUIAction = ReturnType<typeof changeTheme | typeof pullOpened | typeof openPullInNewTab>;
