import * as ActionTypes from '../../../constants';

const initialState = {
  searchTerm: ''
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.query };
    default:
      return state;
  }
};
