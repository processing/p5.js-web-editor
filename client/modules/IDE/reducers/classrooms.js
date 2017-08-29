import * as ActionTypes from '../../../constants';

const classrooms = (state = [], action) => {
  switch (action.type) {
    case ActionTypes.SET_CLASSROOMS:
      return action.classrooms;
    case ActionTypes.DELETE_CLASSROOM:
      return state.filter(classroom =>
        classroom._id !== action.id
      );
    default:
      return state;
  }
};

export default classrooms;
