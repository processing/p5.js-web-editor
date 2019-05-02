import * as ActionTypes from '../../../constants';

const loading = (state = false, action) => {
  switch (action.type) {
    case ActionTypes.START_LOADING:
      return true;
    case ActionTypes.STOP_LOADING:
      return false;
    default:
      return state;
  }
};

export default loading;
