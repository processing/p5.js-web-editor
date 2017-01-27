import * as ActionTypes from '../../../constants';

export function clearConsole() {
  return {
    type: ActionTypes.CLEAR_CONSOLE
  };
}

export function dispatchConsoleEvent(messages) {
  return {
    type: ActionTypes.CONSOLE_EVENT,
    event: messages
  };
}
