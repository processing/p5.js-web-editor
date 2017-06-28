import * as ActionTypes from '../../../constants';

const classrooms = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_CLASSROOMS:
      console.log('SET_CLASSROOMS');
      console.log(action.classrooms);
      return action.classrooms;
    case ActionTypes.DELETE_CLASSROOM:
      return state.filter(classroom =>
        classroom.id !== action.id
      );
    default:
      return state;
  }
};

export default classrooms;
