import * as ActionTypes from '../../constants';

const sketches = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_PROJECTS:
      return action.projects;
    default:
      return state;
  }
};

export default sketches;
