import * as ActionTypes from '../../../constants';

const consoleMax = 500;
const initialState = [];

const console = (state = initialState, action) => {
  let messages;
  switch (action.type) {
    case ActionTypes.CONSOLE_EVENT:
      messages = [...action.event];
      return state.concat(messages).slice(-consoleMax);
    case ActionTypes.CLEAR_CONSOLE:
      return [];
    default:
      return state;
  }
};

export default console;
