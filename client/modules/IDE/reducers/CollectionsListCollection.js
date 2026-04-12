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

export default function collectionsListCollections(
  state = initialState,
  action
) {
  switch (action.type) {
    case ActionTypes.SET_COLLECTIONS_FOR_COLLECTION_LIST:
      return {
        ...state,
        collections: action.collections?.collections ?? [],
        metadata: action.collections?.metadata ?? initialState.metadata
      };

    case ActionTypes.DELETE_COLLECTION:
      return {
        ...state,
        collections: state.collections.filter(
          ({ id }) => action.collectionId !== id
        )
      };

    case ActionTypes.EDIT_COLLECTION:
    case ActionTypes.ADD_TO_COLLECTION:
    case ActionTypes.REMOVE_FROM_COLLECTION:
      return {
        ...state,
        collections: state.collections.map((collection) =>
          collection.id === action.payload.id ? action.payload : collection
        )
      };

    default:
      return state;
  }
}
