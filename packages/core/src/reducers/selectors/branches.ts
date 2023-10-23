/* eslint-disable import/prefer-default-export */
import type { RootState } from '@staticcms/core/store';
import type { Branch } from "@staticcms/core/reducers/branches";

export const selectBranches = (state: RootState): Branch[] => {
  return state.branches.branches || [];
};
