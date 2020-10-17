import * as ActionTypes from '../../../constants';

const initialState = {
  collectionSearchTerm: '',
  sketchSearchTerm: ''
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_SEARCH_TERM:
      return { ...state, [`${action.scope}SearchTerm`]: action.query };
    default:
      return state;
  }
};
