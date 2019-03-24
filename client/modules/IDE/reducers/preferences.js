import * as ActionTypes from '../../../constants';

const initialState = {
  fontSize: 18,
  indentationAmount: 2,
  isTabIndent: true,
  autosave: true,
  linewrap: true,
  lintWarning: false,
  textOutput: false,
  gridOutput: false,
  soundOutput: false,
  theme: 'light',
  autorefresh: false
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
    case ActionTypes.SET_LINEWRAP:
      return Object.assign({}, state, { linewrap: action.value });
    case ActionTypes.SET_LINT_WARNING:
      return Object.assign({}, state, { lintWarning: action.value });
    case ActionTypes.SET_TEXT_OUTPUT:
      return Object.assign({}, state, { textOutput: action.value });
    case ActionTypes.SET_GRID_OUTPUT:
      return Object.assign({}, state, { gridOutput: action.value });
    case ActionTypes.SET_SOUND_OUTPUT:
      return Object.assign({}, state, { soundOutput: action.value });
    case ActionTypes.SET_PREFERENCES:
      return action.preferences;
    case ActionTypes.SET_THEME:
      return Object.assign({}, state, { theme: action.value });
    case ActionTypes.SET_AUTOREFRESH:
      return Object.assign({}, state, { autorefresh: action.value });
    default:
      return state;
  }
};

export default preferences;
