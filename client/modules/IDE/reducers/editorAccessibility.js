import * as ActionTypes from '../../../constants';

const initialState = {
  lintMessages: [],
  forceDesktop: false
};
let messageId = 0;

const editorAccessibility = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_LINT_MESSAGE:
      messageId += 1;
      return Object.assign({}, state, {
        lintMessages: state.lintMessages.concat({
          severity: action.severity,
          line: action.line,
          message: action.message,
          id: messageId
        })
      });
    case ActionTypes.CLEAR_LINT_MESSAGE:
      return Object.assign({}, state, { lintMessages: [] });
    case ActionTypes.TOGGLE_FORCE_DESKTOP:
      return Object.assign({}, state, { forceDesktop: !state.forceDesktop });
    default:
      return state;
  }
};

export default editorAccessibility;
