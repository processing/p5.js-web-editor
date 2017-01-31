import * as ActionTypes from '../../../constants';

const initialState = {
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
    default:
      return state;
  }
};

export default editorAccessibility;
