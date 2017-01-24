import * as ActionTypes from '../../../constants';

const sketches = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_PROJECTS:
      return action.projects;
    case ActionTypes.DELETE_PROJECT:
      return state.filter(sketch =>
        sketch.id !== action.id
      );
    default:
      return state;
  }
};

export default sketches;
