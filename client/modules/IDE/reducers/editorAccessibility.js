import * as ActionTypes from '../../../constants';

const initialState = {
  lintMessages: []
};
let messageId = 0;

const editorAccessibility = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_LINT_MESSAGE:
      messageId += 1;
      return Object.assign({}, state, {
        lintMessages: state.lintMessages.concat({
          severity: action.severity, line: action.line, message: action.message, id: messageId
        })
      });
    case ActionTypes.CLEAR_LINT_MESSAGE:
      return Object.assign({}, state, { lintMessages: [] });
    default:
      return state;
  }
};

export default editorAccessibility;
