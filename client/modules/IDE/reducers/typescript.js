// reducers/typescriptReducer.js

import { TOGGLE_TYPESCRIPT } from '../../../constants';

const initialState = {
  useTypeScript: false
};

const typescriptReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_TYPESCRIPT:
      return {
        ...state,
        useTypeScript: !state.useTypeScript
      };

    default:
      return state;
  }
};

export default typescriptReducer;
