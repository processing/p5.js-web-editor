import i18next from 'i18next';
import * as ActionTypes from '../../../constants';


const initialState = {
  fontSize: 18,
  autosave: true,
  linewrap: true,
  lineNumbers: true,
  lintWarning: false,
  textOutput: false,
  gridOutput: false,
  soundOutput: false,
  theme: 'light',
  autorefresh: false,
  language: 'en-US'
};

const preferences = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_FONT_SIZE:
      console.log(`loading font size ${action.value}`);
      return Object.assign({}, state, { fontSize: action.value });
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
      console.log(`reducer preference loading theme  ${action.value}`);
      return Object.assign({}, state, { theme: action.value });
    case ActionTypes.SET_AUTOREFRESH:
      return Object.assign({}, state, { autorefresh: action.value });
    case ActionTypes.SET_LINE_NUMBERS:
      return Object.assign({}, state, { lineNumbers: action.value });
    case ActionTypes.SET_LANGUAGE:
      console.log(`reducer preference set language lenguage ${action.language}`);
      i18next.changeLanguage(action.language);
      return Object.assign({}, state, { language: action.language });
    default:
      return state;
  }
};

export default preferences;
