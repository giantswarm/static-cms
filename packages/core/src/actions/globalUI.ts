/* eslint-disable import/prefer-default-export */
import {PULL_OPENED, THEME_CHANGE} from '../constants';

import type {PullRequestLike} from "@staticcms/core";

export function changeTheme(theme: string) {
  return { type: THEME_CHANGE, payload: theme } as const;
}

export function pullOpened(pull: PullRequestLike) {
  return { type: PULL_OPENED, payload: pull } as const;
}

export type GlobalUIAction = ReturnType<typeof changeTheme | typeof pullOpened>;
