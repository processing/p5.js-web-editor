import { apiClient } from '../../../utils/apiClient';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from '../reducers/loading';

const buildProjectsUrl = (username, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortField = 'updatedAt',
    sortDir = 'desc',
    q = ''
  } = options;

  const base = username
    ? `/${encodeURIComponent(username)}/projects`
    : '/projects';

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

const fetchProjects = (username, options, successType) => (dispatch) => {
  dispatch(startLoader());

  const url = buildProjectsUrl(username, options);

  return apiClient
    .get(url)
    .then((response) => {
      dispatch({ type: successType, projects: response.data });
      dispatch(stopLoader());
      return response.data;
    })
    .catch((error) => {
      dispatch({ type: ActionTypes.ERROR, error: error?.response?.data });
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
