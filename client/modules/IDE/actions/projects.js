import { opApiClient } from '../../../utils/opApiClient';
import notFoundRedirect from '../../../utils/notFoundRedirect';
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

function isAbortError(error) {
  return (
    error?.code === 'ERR_CANCELED' ||
    error?.name === 'CanceledError' ||
    error?.name === 'AbortError'
  );
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

const SKETCHES_REQUEST_DELAY_MS = 500; // allows user to finish typing before a request is made

let projectsRequest;

function cancelProjectsRequest(dispatch) {
  if (!projectsRequest) {
    return;
  }

  const request = projectsRequest;
  projectsRequest = undefined;
  request.controller.abort();

  if (request.timeoutId) {
    clearTimeout(request.timeoutId);
  } else {
    dispatch(stopLoader());
  }

  request.resolve([]);
}

const fetchProjects = (
  username,
  options,
  successType,
  { redirectIfUserMissing = false } = {}
) => (dispatch, getState) => {
  const { user } = getState();

  // Sketches come from /user/{owner}/sketches. Another user's dashboard is
  // addressed by @username (the API returns only their public sketches);
  // the current user's own dashboard falls back to their id, which requires
  // waiting for auth hydration.
  const owner = username ? `@${username}` : user.id;

  if (!owner) {
    cancelProjectsRequest(dispatch);
    return Promise.resolve([]);
  }

  const { page = 1, limit = 10, q } = options ?? {};
  const offset = (page - 1) * limit;
  const params = { limit, offset, sort: 'desc' };

  if (q?.trim()) {
    params.q = q.trim();
  }

  cancelProjectsRequest(dispatch);
  const requestController = new AbortController();

  return new Promise((resolve, reject) => {
    const request = {
      controller: requestController,
      resolve,
      timeoutId: undefined
    };

    projectsRequest = request;
    request.timeoutId = setTimeout(() => {
      if (projectsRequest !== request) {
        resolve([]);
        return;
      }

      request.timeoutId = undefined;
      dispatch(startLoader());

      opApiClient
        .get(`/user/${owner}/sketches`, {
          params,
          signal: requestController.signal
        })
        .then((response) => normalizeOpProjectsResponse(response, page, limit))
        .then((response) => {
          if (projectsRequest !== request) {
            resolve([]);
            return;
          }

          dispatch({ type: successType, projects: response });
          projectsRequest = undefined;
          dispatch(stopLoader());
          resolve(response.projects);
        })
        .catch((error) => {
          if (projectsRequest !== request) {
            resolve([]);
            return;
          }

          projectsRequest = undefined;
          dispatch(stopLoader());

          if (isAbortError(error)) {
            resolve([]);
            return;
          }

          // A 404 here means the username in the URL has no OP user. On the
          // dashboard that makes the page itself a 404; elsewhere just report
          // an empty list. Either way don't reject — no caller handles it.
          if (error?.response?.status === 404) {
            if (redirectIfUserMissing) {
              dispatch(notFoundRedirect('Toast.UserNotFound'));
            }
            resolve([]);
            return;
          }

          dispatch({
            type: ActionTypes.ERROR,
            error: getRequestErrorPayload(error)
          });
          reject(error);
        });
    }, SKETCHES_REQUEST_DELAY_MS);
  });
};

export const getProjects = (username, options) =>
  fetchProjects(username, options, ActionTypes.SET_PROJECTS, {
    redirectIfUserMissing: true
  });

export const getProjectsForCollectionList = (username, options) =>
  fetchProjects(
    username,
    options,
    ActionTypes.SET_PROJECTS_FOR_COLLECTION_LIST
  );
