import * as ActionTypes from '../../../constants';

const classroom = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_CLASSROOM:
      console.log('SET_CLASSROOM');
      console.log(action.classroom);
      return action.classroom;
    default:
      return state;
  }
};

export default classroom;
