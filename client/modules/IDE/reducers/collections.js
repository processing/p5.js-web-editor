import * as ActionTypes from '../../../constants';

const initialState = {
  collections: [],
  metadata: {
    page: 1,
    totalPages: 1,
    totalCollections: 0,
    limit: 10,
    hasPagination: false
  }
};

const normalizeSetCollections = (data) => {
  if (data == null) {
    return initialState;
  }
  if (Array.isArray(data)) {
    return {
      collections: data,
      metadata: initialState.metadata
    };
  }
  return {
    collections: data.collections ?? [],
    metadata: data.metadata ?? initialState.metadata
  };
};

const sketches = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_COLLECTIONS:
      return normalizeSetCollections(action.collections);

    case ActionTypes.DELETE_COLLECTION:
      return {
        ...state,
        collections: state.collections.filter(
          ({ id }) => action.collectionId !== id
        )
      };

    // The API returns the complete new edited collection
    // with any items added or removed
    case ActionTypes.EDIT_COLLECTION:
    case ActionTypes.ADD_TO_COLLECTION:
    case ActionTypes.REMOVE_FROM_COLLECTION:
      return {
        ...state,
        collections: state.collections.map((collection) => {
          if (collection.id === action.payload.id) {
            return action.payload;
          }

          return collection;
        })
      };
    default:
      return state;
  }
};

export default sketches;
