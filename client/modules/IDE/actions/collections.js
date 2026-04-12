import browserHistory from '../../../browserHistory';
import { apiClient } from '../../../utils/apiClient';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from '../reducers/loading';
import { setToastText, showToast } from './toast';

const TOAST_DISPLAY_TIME_MS = 1500;

// export function getCollections(username) {
//   return (dispatch) => {
//     dispatch(startLoader());
//     let url;
//     if (username) {
//       url = `/${username}/collections`;
//     } else {
//       url = '/collections';
//     }
//     return apiClient
//       .get(url)
//       .then((response) => {
//         dispatch({
//           type: ActionTypes.SET_COLLECTIONS,
//           collections: response.data
//         });
//         dispatch(stopLoader());
//       })
//       .catch((error) => {
//         dispatch({
//           type: ActionTypes.ERROR,
//           error: error?.response?.data
//         });
//         dispatch(stopLoader());
//       });
//   };
// }

export function createCollection(collection) {
  return (dispatch) => {
    dispatch(startLoader());
    const url = '/collections';
    return apiClient
      .post(url, collection)
      .then((response) => {
        dispatch({
          type: ActionTypes.CREATE_COLLECTION
        });
        dispatch(stopLoader());

        const newCollection = response.data;
        dispatch(setToastText(`Created "${newCollection.name}"`));
        dispatch(showToast(TOAST_DISPLAY_TIME_MS));

        const pathname = `/${newCollection.owner.username}/collections/${newCollection.id}`;
        const location = { pathname, state: { skipSavingPath: true } };

        browserHistory.push(location);
      })
      .catch((error) => {
        dispatch({
          type: ActionTypes.ERROR,
          error: error?.response?.data
        });
        dispatch(stopLoader());
      });
  };
}

export function addToCollection(collectionId, projectId) {
  return (dispatch) => {
    dispatch(startLoader());
    const url = `/collections/${collectionId}/${projectId}`;
    return apiClient
      .post(url)
      .then((response) => {
        dispatch({
          type: ActionTypes.ADD_TO_COLLECTION,
          payload: response.data
        });
        dispatch(stopLoader());

        const collectionName = response.data.name;

        dispatch(setToastText(`Added to "${collectionName}"`));
        dispatch(showToast(TOAST_DISPLAY_TIME_MS));

        return response.data;
      })
      .catch((error) => {
        dispatch({
          type: ActionTypes.ERROR,
          error: error?.response?.data
        });
        dispatch(stopLoader());
      });
  };
}

export function removeFromCollection(collectionId, projectId) {
  return (dispatch) => {
    dispatch(startLoader());
    const url = `/collections/${collectionId}/${projectId}`;
    return apiClient
      .delete(url)
      .then((response) => {
        dispatch({
          type: ActionTypes.REMOVE_FROM_COLLECTION,
          payload: response.data
        });
        dispatch(stopLoader());

        const collectionName = response.data.name;

        dispatch(setToastText(`Removed from "${collectionName}"`));
        dispatch(showToast(TOAST_DISPLAY_TIME_MS));

        return response.data;
      })
      .catch((error) => {
        dispatch({
          type: ActionTypes.ERROR,
          error: error?.response?.data
        });
        dispatch(stopLoader());
      });
  };
}

export function editCollection(collectionId, { name, description }) {
  return (dispatch) => {
    const url = `/collections/${collectionId}`;
    return apiClient
      .patch(url, { name, description })
      .then((response) => {
        dispatch({
          type: ActionTypes.EDIT_COLLECTION,
          payload: response.data
        });
        return response.data;
      })
      .catch((error) => {
        dispatch({
          type: ActionTypes.ERROR,
          error: error?.response?.data
        });
      });
  };
}

export function deleteCollection(collectionId) {
  return (dispatch) => {
    const url = `/collections/${collectionId}`;
    return apiClient
      .delete(url)
      .then((response) => {
        dispatch({
          type: ActionTypes.DELETE_COLLECTION,
          payload: response.data,
          collectionId
        });
        return response.data;
      })
      .catch((error) => {
        dispatch({
          type: ActionTypes.ERROR,
          error: error?.response?.data
        });
      });
  };
}
const buildCollectionUrl = (username, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortField = 'updatedAt',
    sortDir = 'desc',
    q = ''
  } = options;

  const base = username
    ? `/${encodeURIComponent(username)}/collections`
    : '/collections';

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortField,
    sortDir
  });

  const trimmed = q.trim();

  if (trimmed) {
    params.set('q', trimmed);
  }

  return `${base}?${params.toString()}`;
};

const fetchCollections = (username, options, successType) => (dispatch) => {
  dispatch(startLoader());

  const url = buildCollectionUrl(username, options);

  return apiClient
    .get(url)
    .then((response) => {
      dispatch({ type: successType, collections: response.data });
      dispatch(stopLoader());
      return response.data;
    })
    .catch((error) => {
      dispatch({ type: ActionTypes.ERROR, error: error?.response?.data });
      dispatch(stopLoader());
      throw error;
    });
};

export const getCollections = (username, options) =>
  fetchCollections(username, options, ActionTypes.SET_COLLECTIONS);

export const getCollectionsForCollectionList = (username, options) =>
  fetchCollections(
    username,
    options,
    ActionTypes.SET_COLLECTIONS_FOR_COLLECTION_LIST
  );
