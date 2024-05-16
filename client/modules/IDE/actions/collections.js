import browserHistory from '../../../browserHistory';
import apiClient from '../../../utils/apiClient';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from '../reducers/loading';
import { setToastText, showToast } from './toast';

import {
  setCollections,
  delCollection,
  updateCollection
} from '../reducers/collections';

const TOAST_DISPLAY_TIME_MS = 1500;

export function getCollections(username) {
  return (dispatch) => {
    dispatch(startLoader());
    let url;
    if (username) {
      url = `/${username}/collections`;
    } else {
      url = '/collections';
    }
    return apiClient
      .get(url)
      .then((response) => {
        dispatch(setCollections(response.data));
        dispatch(stopLoader());
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
        dispatch(updateCollection(response.data));
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
        dispatch(updateCollection(response.data));
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
        dispatch(updateCollection(response.data));
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
        dispatch(deleteCollection(response.data, collectionId));
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
