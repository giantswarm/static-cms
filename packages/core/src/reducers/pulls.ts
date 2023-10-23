import {
  LOAD_PULLS_FAILURE,
  LOAD_PULLS_REQUEST,
  LOAD_PULLS_SUCCESS,
} from '@staticcms/core/constants';

import type { PullsAction } from '../actions/pulls';
import type { PullRequestLike } from '../interface';

export interface PullsState {
  pulls?: PullRequestLike[];
  isFetching: boolean;
  error?: string;
}

const defaultState: PullsState = {
  isFetching: false
}

function pulls(state: PullsState = defaultState, action: PullsAction): PullsState {
  switch (action.type) {
    case LOAD_PULLS_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case LOAD_PULLS_SUCCESS:
      return {
        ...state,
        pulls: action.payload,
        isFetching: false,
        error: undefined,
      };
    case LOAD_PULLS_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.payload.toString(),
      };

    default:
      return state;
  }
}

export default pulls;
