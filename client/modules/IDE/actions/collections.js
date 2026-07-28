import browserHistory from '../../../browserHistory';
import { opApiClient } from '../../../utils/opApiClient';
import {
  collectionToOpCurationPayload,
  opCurationToCollection,
  opCurationToCollectionId,
  opCurationWithSketchesToCollection
} from '../../../utils/opCurationAdapter';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from '../reducers/loading';
import { setToastText, showToast } from './toast';
import notFoundRedirect from '../../../utils/notFoundRedirect';

const TOAST_DISPLAY_TIME_MS = 1500;
const MAX_PAGE_SIZE = 1000;

function getErrorPayload(error, fallbackMessage = 'Request failed.') {
  const data = error?.response?.data;
  if (data && typeof data === 'object') {
    return data;
  }
  return { message: data || error?.message || fallbackMessage };
}

// Fetch a single curation together with its sketches and build a fully
// populated collection object (the shape the store/components expect).
function fetchCollectionWithItems(collectionId) {
  return Promise.all([
    opApiClient.get(`/curation/${collectionId}`),
    opApiClient.get(`/curation/${collectionId}/sketches`, {
      params: { limit: MAX_PAGE_SIZE, sort: 'desc' }
    })
  ]).then(([curationRes, sketchesRes]) =>
    opCurationWithSketchesToCollection(curationRes.data, sketchesRes.data || [])
  );
}

export function getCollections(
  username,
  { redirectIfUserMissing = false } = {}
) {
  return (dispatch, getState) => {
    dispatch(startLoader());
    const owner = username || getState().user.username;
    return opApiClient
      .get(`/user/@${owner}/curations`, {
        params: { limit: MAX_PAGE_SIZE, sort: 'desc' }
      })
      .then((response) => {
        const collections = (response.data || []).map((curation) =>
          opCurationToCollection(curation, owner)
        );
        dispatch({
          type: ActionTypes.SET_COLLECTIONS,
          collections
        });
        dispatch(stopLoader());
      })
      .catch((error) => {
        dispatch(stopLoader());

        // 404 means the username in the URL has no OP user. On the dashboard
        // that makes the page itself a 404; elsewhere an empty list will do.
        if (error?.response?.status === 404) {
          if (redirectIfUserMissing) {
            dispatch(notFoundRedirect('Toast.UserNotFound'));
          }
          return;
        }

        dispatch({
          type: ActionTypes.ERROR,
          error: getErrorPayload(error)
        });
      });
  };
}

// Load a single collection (with its sketches) and upsert it into the store.
// A missing collection — or one owned by someone other than the username in
// the URL — surfaces as a toast rather than an error modal.
export function getCollection(collectionId, ownerUsername) {
  return (dispatch) => {
    dispatch(startLoader());
    return fetchCollectionWithItems(collectionId)
      .then((collection) => {
        if (
          ownerUsername &&
          collection.owner.username &&
          collection.owner.username.toLowerCase() !==
            ownerUsername.toLowerCase()
        ) {
          dispatch(stopLoader());
          dispatch(notFoundRedirect('Toast.CollectionNotFound'));
          return null;
        }

        dispatch({
          type: ActionTypes.SET_COLLECTION,
          collection
        });
        dispatch(stopLoader());
        return collection;
      })
      .catch((error) => {
        dispatch(stopLoader());

        if (error?.response?.status === 404) {
          dispatch(notFoundRedirect('Toast.CollectionNotFound'));
          return null;
        }

        dispatch({
          type: ActionTypes.ERROR,
          error: getErrorPayload(error)
        });
        return null;
      });
  };
}

// Returns the list of collection ids (slugs) a sketch already belongs to.
export function getCollectionIdsForSketch(projectId) {
  return () =>
    opApiClient
      .get(`/sketch/${projectId}/curations`, {
        params: { limit: MAX_PAGE_SIZE }
      })
      .then((response) =>
        (response.data || []).map((curation) =>
          opCurationToCollectionId(curation)
        )
      )
      .catch(() => []);
}

export function createCollection({ name, description }) {
  return (dispatch) => {
    dispatch(startLoader());
    return opApiClient
      .post('/curation', collectionToOpCurationPayload({ name, description }))
      .then((response) => {
        const newCollection = opCurationToCollection(response.data);
        dispatch({ type: ActionTypes.CREATE_COLLECTION });
        dispatch({
          type: ActionTypes.SET_COLLECTION,
          collection: newCollection
        });
        dispatch(stopLoader());

        dispatch(setToastText(`Created "${newCollection.name}"`));
        dispatch(showToast(TOAST_DISPLAY_TIME_MS));

        const pathname = `/${newCollection.owner.username}/collections/${newCollection.id}`;
        browserHistory.push({
          pathname,
          state: { skipSavingPath: true }
        });

        return newCollection;
      })
      .catch((error) => {
        dispatch({
          type: ActionTypes.ERROR,
          error: getErrorPayload(error)
        });
        dispatch(stopLoader());
      });
  };
}

export function addToCollection(collectionId, projectId) {
  return (dispatch) => {
    dispatch(startLoader());
    return opApiClient
      .post(`/curation/${collectionId}/sketches/${projectId}`)
      .then(() => fetchCollectionWithItems(collectionId))
      .then((collection) => {
        dispatch({
          type: ActionTypes.ADD_TO_COLLECTION,
          payload: collection
        });
        dispatch(stopLoader());

        dispatch(setToastText(`Added to "${collection.name}"`));
        dispatch(showToast(TOAST_DISPLAY_TIME_MS));

        return collection;
      })
      .catch((error) => {
        dispatch({
          type: ActionTypes.ERROR,
          error: getErrorPayload(error)
        });
        dispatch(stopLoader());
      });
  };
}

export function removeFromCollection(collectionId, projectId) {
  return (dispatch) => {
    dispatch(startLoader());
    return opApiClient
      .delete(`/curation/${collectionId}/sketches/${projectId}`)
      .then(() => fetchCollectionWithItems(collectionId))
      .then((collection) => {
        dispatch({
          type: ActionTypes.REMOVE_FROM_COLLECTION,
          payload: collection
        });
        dispatch(stopLoader());

        dispatch(setToastText(`Removed from "${collection.name}"`));
        dispatch(showToast(TOAST_DISPLAY_TIME_MS));

        return collection;
      })
      .catch((error) => {
        dispatch({
          type: ActionTypes.ERROR,
          error: getErrorPayload(error)
        });
        dispatch(stopLoader());
      });
  };
}

export function editCollection(collectionId, { name, description }) {
  return (dispatch) =>
    opApiClient
      .patch(
        `/curation/${collectionId}`,
        collectionToOpCurationPayload({ name, description })
      )
      // Refetch with items so the stored collection keeps its sketches.
      .then(() => fetchCollectionWithItems(collectionId))
      .then((collection) => {
        dispatch({
          type: ActionTypes.EDIT_COLLECTION,
          payload: collection
        });
        return collection;
      })
      .catch((error) => {
        dispatch({
          type: ActionTypes.ERROR,
          error: getErrorPayload(error)
        });
      });
}

export function deleteCollection(collectionId) {
  return (dispatch) =>
    opApiClient
      .delete(`/curation/${collectionId}`)
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
          error: getErrorPayload(error)
        });
      });
}
