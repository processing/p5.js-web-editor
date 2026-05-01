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

const normalizeProjectsPayload = (payload, currentMetadata) => {
  if (Array.isArray(payload)) {
    return {
      projects: payload,
      metadata: {
        ...currentMetadata,
        totalProjects: payload.length
      }
    };
  }

  return {
    projects: payload?.projects ?? [],
    metadata: payload?.metadata ?? currentMetadata
  };
};

const sketches = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_PROJECTS:
      return normalizeProjectsPayload(action.projects, state.metadata);
    case ActionTypes.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter((sketch) => sketch.id !== action.id)
      };
    case ActionTypes.CHANGE_VISIBILITY: {
      const updatedProjects = state.projects.map((sketch) =>
        sketch.id === action.payload.id
          ? { ...sketch, visibility: action.payload.visibility }
          : sketch
      );

      return {
        ...state,
        projects: updatedProjects
      };
    }

    case ActionTypes.RENAME_PROJECT: {
      const updatedproject = state.projects.map((sketch) => {
        if (sketch.id === action.payload.id) {
          return { ...sketch, name: action.payload.name };
        }
        return sketch;
      });

      return {
        ...state,
        projects: updatedproject
      };
    }
    default:
      return state;
  }
};

export default sketches;
