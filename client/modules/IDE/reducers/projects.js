import * as ActionTypes from '../../../constants';

const sketches = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_PROJECTS:
      return action.projects;
    case ActionTypes.DELETE_PROJECT:
      return state.filter(sketch =>
        sketch.id !== action.id);
    case ActionTypes.SORT_ASCENDING_CREATEDAT:
      return state.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case ActionTypes.SORT_DESCENDING_CREATEDAT:
      return state.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case ActionTypes.SORT_ASCENDING_UPDATEDAT:
      return state.slice().sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    case ActionTypes.SORT_DESCENDING_UPDATEDAT:
      return state.slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    default:
      return state;
  }
};

export default sketches;
