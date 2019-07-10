import * as ActionTypes from '../../../constants';

const sketches = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_COLLECTIONS:
      return action.collections;

    case ActionTypes.DELETE_COLLECTION:
      return state.filter(({ id }) => id !== action.collectionId);

    // The API returns the complete updated collection
    // with the changes made
    case ActionTypes.UPDATE_COLLECTION:
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
