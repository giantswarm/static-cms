import {
  LOAD_BRANCHES_FAILURE,
  LOAD_BRANCHES_REQUEST,
  LOAD_BRANCHES_SUCCESS,
} from '@staticcms/core/constants';

import type { BranchesAction } from '../actions/branches';
import type { SelectField } from '../interface';

export interface Branch {
  name: string;
}

export interface BranchesState extends SelectField {
  branches?: Branch[];
  isFetching: boolean;
  error?: string;
}

const defaultState: BranchesState = {
  name: 'branches',
  options: [],
  multiple: false,
  widget: 'select',
  isFetching: false,
};

function branches(state: BranchesState = defaultState, action: BranchesAction): BranchesState {
  switch (action.type) {
    case LOAD_BRANCHES_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case LOAD_BRANCHES_SUCCESS:
      return {
        ...state,
        branches: action.payload,
        isFetching: false,
        error: undefined,
      };
    case LOAD_BRANCHES_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.payload.toString(),
      };

    default:
      return state;
  }
}

export default branches;
