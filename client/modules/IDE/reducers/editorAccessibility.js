import * as ActionTypes from '../../../constants';

const initialState = {
  lineNo: 'line',
  lintMessages: []
};

const editorAccessibility = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_LINT_MESSAGE:
      return Object.assign({}, state, {
        lintMessages: state.lintMessages.concat(
          { severity: action.severity, line: action.line, message: action.message })
      });
    case ActionTypes.CLEAR_LINT_MESSAGE:
      return Object.assign({}, state, { lintMessages: [] });
    case ActionTypes.UPDATE_LINENUMBER:
      return Object.assign({}, state, { lineNo: `line ${action.lineNo}` });
    default:
      return state;
  }
};

export default editorAccessibility;
