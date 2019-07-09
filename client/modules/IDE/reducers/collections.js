import * as ActionTypes from '../../../constants';

const sketches = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_COLLECTIONS:
      return action.collections;

    // The API returns the complete new collection
    // with the items added or removed
    case ActionTypes.ADD_TO_COLLECTION:
    case ActionTypes.REMOVE_FROM_COLLECTION:
      return state.map((collection) => {
        if (collection.id === action.payload.id) {
          return action.payload;
        }

        return collection;
      });
    default:
      return state;
  }
};

export default sketches;
