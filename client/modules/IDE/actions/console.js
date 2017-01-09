import * as ActionTypes from '../../../constants';

export function clearConsole() {
  return {
    type: ActionTypes.CLEAR_CONSOLE
  };
}

export function dispatchConsoleEvent(...args) {
  return {
    type: ActionTypes.CONSOLE_EVENT,
    event: args[0].data
  };
}
