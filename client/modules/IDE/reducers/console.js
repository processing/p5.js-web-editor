import * as ActionTypes from '../../../constants';

const consoleMax = 200;
const initialState = [];

const console = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.CONSOLE_EVENT:
      return state.concat(action.event).slice(-consoleMax);
    case ActionTypes.CLEAR_CONSOLE:
      return [];
    default:
      return state;
  }
};

export default console;
