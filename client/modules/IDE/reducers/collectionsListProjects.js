import * as ActionTypes from '../../../constants';

const initialState = {
  projects: [],
  metadata: {
    page: 1,
    totalPages: 1,
    totalProjects: 0,
    limit: 10,
    hasPagination: true
  }
};

export default function collectionsListProjects(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_PROJECTS_FOR_COLLECTION_LIST:
      return {
        ...state,
        projects: action.projects.projects,
        metadata: action.projects.metadata
      };

    default:
      return state;
  }
}
