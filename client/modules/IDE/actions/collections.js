import browserHistory from '../../../browserHistory';
import apiClient from '../../../utils/apiClient';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from './loader';
import { setToastText, showToast } from './toast';

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
        dispatch({
          type: ActionTypes.SET_COLLECTIONS,
          collections: response.data
        });
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
        dispatch({
          type: ActionTypes.ADD_TO_COLLECTION,
          payload: response.data
        });
        dispatch(stopLoader());

        const collectionName = response.data.name;

        dispatch(setToastText(`Added to "${collectionName}`));
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

export function sendSketchRequest(collectionId, projectId, collectionOwner) {
  return (dispatch) => {
    dispatch(startLoader());
    dispatch(setToastText('Request has been sent!'));
    dispatch(showToast(TOAST_DISPLAY_TIME_MS));
    const url = `/collections/${collectionId}/${projectId}/request`;
    console.log(url);

    const reqBody = {
      collectionOwner,
      collectionId
    };
    return apiClient
      .post(url, reqBody)
      .then((response) => {
        dispatch({
          type: ActionTypes.REQ_TO_OWNER,
          payload: response.data
        });
        dispatch(stopLoader());
      })
      .catch((error) => {
        dispatch({
          type: ActionTypes.ERROR,
          error: error?.response?.data
        });
      });
  };
}

export function declineRequest(collectionId, projectId) {
  return (dispatch) => {
    dispatch(startLoader());
    dispatch(setToastText('Request disallowed'));
    dispatch(showToast(TOAST_DISPLAY_TIME_MS));
    const url = `/collections/${collectionId}/${projectId}/disallow`;

    return apiClient
      .delete(url)
      .then((response) => {
        dispatch({
          type: ActionTypes.DISALLOW_REQ,
          payload: response.data
        });
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
// fetching requests that have been sent for you
export function getOthersRequests() {
  return async (dispatch) => {
    try {
      dispatch(startLoader());
      const url = '/collections/messages/';

      const response = await apiClient.get(url);
      dispatch(stopLoader());

      const { data } = response;

      return data;
    } catch (err) {
      dispatch({
        type: ActionTypes.ERROR,
        error: err?.response?.data
      });
      dispatch(stopLoader());
      throw err;
    }
  };
}

// fetching requests that you have sent
export function getYourRequests() {
  return async (dispatch) => {
    try {
      dispatch(startLoader());
      const url = '/collections/messages/your/';

      const response = await apiClient.get(url);
      dispatch(stopLoader());

      const { data } = response;

      return data;
    } catch (err) {
      dispatch({
        type: ActionTypes.ERROR,
        error: err?.response?.data
      });
      dispatch(stopLoader());
      throw err;
    }
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

        dispatch(setToastText(`Removed from "${collectionName}`));
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
