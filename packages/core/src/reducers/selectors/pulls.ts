/* eslint-disable import/prefer-default-export */
import type { RootState } from '@staticcms/core/store';
import type { PullRequestLike } from "@staticcms/core";

export const selectPulls = (state: RootState): PullRequestLike[] => {
  return state.pulls.pulls || [];
};
