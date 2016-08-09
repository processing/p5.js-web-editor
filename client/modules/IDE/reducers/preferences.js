import * as ActionTypes from '../../../constants';

const initialState = {
  fontSize: 18,
  indentationAmount: 2,
  isTabIndent: true,
  autosave: true
};

const preferences = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_FONT_SIZE:
      return Object.assign({}, state, { fontSize: action.value });
    case ActionTypes.SET_INDENTATION:
      return Object.assign({}, state, { indentationAmount: action.value });
    case ActionTypes.INDENT_WITH_TAB:
      return Object.assign({}, state, {
        isTabIndent: true
      });
    case ActionTypes.INDENT_WITH_SPACE:
      return Object.assign({}, state, {
        isTabIndent: false
      });
    case ActionTypes.SET_AUTOSAVE:
      return Object.assign({}, state, { autosave: action.value });
    default:
      return state;
  }
};

export default preferences;
