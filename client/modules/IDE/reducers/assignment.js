import * as ActionTypes from '../../../constants';

const initialState = () => { // eslint-disable-line
  return {
    assignment: {}
  };
};

const assignment = (state, action) => {
  if (state === undefined) {
    state = initialState(); // eslint-disable-line
  }
  switch (action.type) {
    case ActionTypes.SET_ASSIGNMENT:
      console.log('assignment reducer: SET_ASSIGNMENT');
      console.log(action.assignment);
      return action.assignment;
    default:
      return state;
  }
};

export default assignment;
