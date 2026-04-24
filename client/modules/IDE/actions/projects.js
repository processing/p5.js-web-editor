import { opApiClient } from '../../../utils/opApiClient';
import {
  opPrivacyToVisibility,
  opVisualIdToProjectId
} from '../../../utils/opSketchAdapter';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from '../reducers/loading';

function getRequestErrorPayload(error, fallbackMessage = 'Request failed.') {
  const data = error?.response?.data;
  if (data && typeof data === 'object') {
    return data;
  }

  return {
    message:
      data || error?.response?.message || error?.message || fallbackMessage
  };
}

const fetchProjects = (options, successType) => (dispatch, getState) => {
  const { user } = getState();
  const userID = user.id;

  if (!userID) {
    dispatch({
      type: ActionTypes.ERROR,
      error: { message: 'User not authenticated' }
    });
    return Promise.reject(new Error('User not authenticated'));
  }

  const { page = 1, limit = 10 } = options ?? {};
  const offset = (page - 1) * limit;

  dispatch(startLoader());

  return opApiClient
    .get(`/user/${userID}/sketches`, {
      params: { limit, offset, sort: 'desc' }
    })
    .then((response) => {
      const projects = response.data.map((s) => ({
        id: opVisualIdToProjectId(s.visualID),
        name: s.title,
        createdAt: s.createdOn,
        updatedAt: s.createdOn,
        visibility: opPrivacyToVisibility(s.isPrivate ?? 0)
      }));
      dispatch({ type: successType, projects });
      dispatch(stopLoader());
      return projects;
    })
    .catch((error) => {
      dispatch({
        type: ActionTypes.ERROR,
        error: getRequestErrorPayload(error)
      });
      dispatch(stopLoader());
      throw error;
    });
};

export const getProjects = (username, options) =>
  fetchProjects(options, ActionTypes.SET_PROJECTS);

export const getProjectsForCollectionList = (username, options) =>
  fetchProjects(options, ActionTypes.SET_PROJECTS_FOR_COLLECTION_LIST);
