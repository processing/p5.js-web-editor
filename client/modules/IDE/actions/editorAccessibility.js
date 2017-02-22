import * as ActionTypes from '../../../constants';

export function updateLintMessage(severity, line, message) {
  return {
    type: ActionTypes.UPDATE_LINT_MESSAGE,
    severity,
    line,
    message
  };
}

export function clearLintMessage() {
  return {
    type: ActionTypes.CLEAR_LINT_MESSAGE
  };
}
