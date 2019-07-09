import * as ActionTypes from '../../../constants';

const sketches = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_COLLECTIONS:
      return action.collections;
    default:
      return state;
  }
};

export default sketches;
