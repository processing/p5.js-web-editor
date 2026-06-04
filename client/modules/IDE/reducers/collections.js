import * as ActionTypes from '../../../constants';

const sketches = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_COLLECTIONS:
      return action.collections;

    // Upsert a single, fully-loaded collection (with its items) into the list.
    case ActionTypes.SET_COLLECTION: {
      const exists = state.some(({ id }) => id === action.collection.id);
      if (exists) {
        return state.map((collection) =>
          collection.id === action.collection.id
            ? action.collection
            : collection
        );
      }
      return [...state, action.collection];
    }

    case ActionTypes.DELETE_COLLECTION:
      return state.filter(({ id }) => action.collectionId !== id);

    // The API returns the complete new edited collection
    // with any items added or removed
    case ActionTypes.EDIT_COLLECTION:
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
