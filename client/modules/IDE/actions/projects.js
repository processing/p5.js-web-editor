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

function getTotalCountHeader(headers) {
  return (
    headers?.get?.('x-total-count') ??
    headers?.['x-total-count'] ??
    headers?.['X-Total-Count']
  );
}

function normalizeOpProjectsResponse(response, page, limit) {
  const projects = response.data.map((s) => ({
    id: opVisualIdToProjectId(s.visualID),
    name: s.title,
    createdAt: s.createdOn,
    updatedAt: s.createdOn,
    visibility: opPrivacyToVisibility(s.isPrivate ?? 0)
  }));
  const totalProjects = Number(getTotalCountHeader(response.headers));
  const normalizedTotalProjects = Number.isFinite(totalProjects)
    ? totalProjects
    : projects.length;
  const totalPages = Math.max(1, Math.ceil(normalizedTotalProjects / limit));

  return {
    projects,
    metadata: {
      page,
      totalPages,
      totalProjects: normalizedTotalProjects,
      limit,
      hasPagination: totalPages > 1
    }
  };
}

const fetchProjects = (username, options, successType) => (
  dispatch,
  getState
) => {
  const { user } = getState();
  const { id: userID } = user;
  const isOwnDashboard =
    Boolean(userID) && (!username || username === user.username);

  // In OP-backed mode sketches are fetched from /user/{userID}/sketches, so
  // wait until auth hydration gives us the current user's ID before requesting.
  if (!userID) {
    return Promise.resolve([]);
  }

  if (!isOwnDashboard) {
    return Promise.resolve([]);
  }

  const { page = 1, limit = 10 } = options ?? {};
  const offset = (page - 1) * limit;

  dispatch(startLoader());

  const request = opApiClient
    .get(`/user/${userID}/sketches`, {
      params: { limit, offset, sort: 'desc' }
    })
    .then((response) => normalizeOpProjectsResponse(response, page, limit));

  return request
    .then((response) => {
      dispatch({ type: successType, projects: response });
      dispatch(stopLoader());
      return response.projects;
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
  fetchProjects(username, options, ActionTypes.SET_PROJECTS);

export const getProjectsForCollectionList = (username, options) =>
  fetchProjects(
    username,
    options,
    ActionTypes.SET_PROJECTS_FOR_COLLECTION_LIST
  );
