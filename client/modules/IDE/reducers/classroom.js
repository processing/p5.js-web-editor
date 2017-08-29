import * as ActionTypes from '../../../constants';

const initialState = () => { // eslint-disable-line
  return {
    assignments: []
  };
};

const classroom = (state, action) => {
  if (state === undefined) {
    state = initialState(); // eslint-disable-line
  }
  switch (action.type) {
    case ActionTypes.SET_CLASSROOM:
      return action.classroom;
    case ActionTypes.CLASSROOM_SAVE_SUCCESS:
      return state;
    default:
      return state;
  }
};

export default classroom;
