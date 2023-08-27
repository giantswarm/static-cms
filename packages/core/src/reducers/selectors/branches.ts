/* eslint-disable import/prefer-default-export */
import type { RootState } from '@staticcms/core/store';

export const selectBranches = (state: RootState) => {
  return state.branches.branches;
};
