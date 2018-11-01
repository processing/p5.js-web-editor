import * as ActionTypes from '../../../constants';

const consoleMax = 500;
const initialState = [];
let messageId = 0;

const console = (state = initialState, action) => {
  let messages;
  switch (action.type) {
    case ActionTypes.CONSOLE_EVENT:
      messages = [...action.event];
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
