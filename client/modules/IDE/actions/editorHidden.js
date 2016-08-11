import * as ActionTypes from '../../../constants';

export function toggleBeep() {
  return {
    type: ActionTypes.TOGGLE_BEEP
  };
}

export function updateLintMessage(severity, line, message) {
  return {
    type: ActionTypes.UPDATE_LINTMESSAGE,
    severity,
    line,
    message
  };
}

export function clearLintMessage() {
  return {
    type: ActionTypes.CLEAR_LINTMESSAGE
  };
}

export function updateLineNumber(lineNo) {
  return {
    type: ActionTypes.UPDATE_LINENUMBER,
    lineNo
  };
}
