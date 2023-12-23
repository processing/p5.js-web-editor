// searchReducer.js
import * as ActionTypes from '../../../constants';

const initialState = {
  searchQuery: '' // Set the initial value to an empty string
};

const searchQuery = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.query };
    default:
      return state;
  }
};

export default searchQuery;
