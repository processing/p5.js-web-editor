import * as ActionTypes from '../../../constants';

const initialState = {
  searchTerm: ''
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SORT_SEARCH:
      return { ...state, searchTerm: action.query };
    default:
      return state;
  }
};
