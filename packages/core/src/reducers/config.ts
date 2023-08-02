import {BRANCH_SWITCH, CONFIG_FAILURE, CONFIG_REQUEST, CONFIG_SUCCESS} from '../constants';
import {currentBackend} from "@staticcms/core/backend";
import GitHub from "@staticcms/core/backends/github/implementation";

import type { ConfigAction } from '../actions/config';
import type { BaseField, Config, UnknownField } from '../interface';


export interface ConfigState<EF extends BaseField = UnknownField> {
  config?: Config<EF>;
  isFetching: boolean;
  error?: string;
}

const defaultState: ConfigState = {
  isFetching: true,
};

const config = (state: ConfigState = defaultState, action: ConfigAction) => {
  switch (action.type) {
    case BRANCH_SWITCH:
    {
      const nextState: ConfigState = {
        ...state,
        config: state.config ?
        {
          ...state.config,
          collections: {
            ...state.config.collections
          },
          backend: {
            ...state.config.backend,
            branch: action.branch
          }
        }: undefined
      };

      if (nextState.config) {
        const backend = currentBackend(nextState.config);
        if (backend && backend.implementation instanceof GitHub) {
          (backend.implementation as GitHub).setBranch(action.branch);
        }
      }

      return nextState;
    }
    case CONFIG_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case CONFIG_SUCCESS:
      return {
        config: action.payload,
        isFetching: false,
        error: undefined,
      };
    case CONFIG_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.payload.toString(),
      };

    default:
      return state;
  }
};

export default config;
