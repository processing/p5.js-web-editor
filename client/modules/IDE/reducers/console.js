import * as ActionTypes from '../../../constants';

const consoleMax = 200;
const initialState = [];
let messageId = 0;

const console = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.CONSOLE_EVENT:
      const messages = [...action.event];
      messages.forEach((message) => {
        message.id = messageId;
        messageId += 1;
      });
      return state.concat(messages).slice(-consoleMax);
    case ActionTypes.CLEAR_CONSOLE:
      return [];
    default:
      return state;
  }
};

export default console;
