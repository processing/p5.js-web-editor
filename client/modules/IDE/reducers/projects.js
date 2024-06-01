import * as ActionTypes from '../../../constants';

const sketches = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_PROJECTS:
      return action.projects;
    case ActionTypes.DELETE_PROJECT:
      return state.filter((sketch) => sketch.id !== action.id);
    case ActionTypes.CHANGE_VISIBILITY: {
      return state.map((sketch) => {
        if (sketch.id === action.payload.id) {
          return { ...sketch, visibility: action.payload.visibility };
        }
        return { ...sketch };
      });
    }
    case ActionTypes.RENAME_PROJECT: {
      return state.map((sketch) => {
        if (sketch.id === action.payload.id) {
          return { ...sketch, name: action.payload.name };
        }
        return { ...sketch };
      });
    }
    default:
      return state;
  }
};

export default sketches;
