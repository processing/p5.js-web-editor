import * as ActionTypes from '../../../constants';

const initialState = {
  enableBeep: false,
  lineNo: 0,
  lintMessages: []
};

const editorAccessibility = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_BEEP:
      return Object.assign({}, state, { enableBeep: !state.enableBeep });
    case ActionTypes.UPDATE_LINTMESSAGE:
      return Object.assign({}, state, {
        lintMessages: state.lintMessages.concat(
          { severity: action.severity, line: action.line, message: action.message })
      });
    case ActionTypes.CLEAR_LINTMESSAGE:
      return Object.assign({}, state, { lintMessages: [] });
    case ActionTypes.UPDATE_LINENUMBER:
      return Object.assign({}, state, { lineNo: action.lineNo });
    default:
      return state;
  }
};

export default editorAccessibility;
