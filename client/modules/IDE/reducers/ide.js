import * as ActionTypes from '../../../constants';

const initialState = {
  isPlaying: false,
  isTextOutputPlaying: false,
  consoleEvent: {
    method: undefined,
    arguments: []
  },
  modalIsVisible: false,
  sidebarIsExpanded: false,
  consoleIsExpanded: false,
  preferencesIsVisible: false,
  projectOptionsVisible: false,
  newFolderModalVisible: false
};

const ide = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_SKETCH:
      return Object.assign({}, state, { isPlaying: !state.isPlaying });
    case ActionTypes.START_SKETCH:
      return Object.assign({}, state, { isPlaying: true });
    case ActionTypes.STOP_SKETCH:
      return Object.assign({}, state, { isPlaying: false });
    case ActionTypes.START_TEXT_OUTPUT:
      return Object.assign({}, state, { isTextOutputPlaying: true });
    case ActionTypes.STOP_TEXT_OUTPUT:
      return Object.assign({}, state, { isTextOutputPlaying: false });
    case ActionTypes.CONSOLE_EVENT:
      return Object.assign({}, state, { consoleEvent: action.event });
    case ActionTypes.SHOW_MODAL:
      return Object.assign({}, state, { modalIsVisible: true });
    case ActionTypes.HIDE_MODAL:
      return Object.assign({}, state, { modalIsVisible: false });
    case ActionTypes.COLLAPSE_SIDEBAR:
      return Object.assign({}, state, { sidebarIsExpanded: false });
    case ActionTypes.EXPAND_SIDEBAR:
      return Object.assign({}, state, { sidebarIsExpanded: true });
    case ActionTypes.COLLAPSE_CONSOLE:
      return Object.assign({}, state, { consoleIsExpanded: false });
    case ActionTypes.EXPAND_CONSOLE:
      return Object.assign({}, state, { consoleIsExpanded: true });
    case ActionTypes.OPEN_PREFERENCES:
      return Object.assign({}, state, { preferencesIsVisible: true });
    case ActionTypes.CLOSE_PREFERENCES:
      return Object.assign({}, state, { preferencesIsVisible: false });
    case ActionTypes.RESET_PROJECT:
      return initialState;
    case ActionTypes.OPEN_PROJECT_OPTIONS:
      return Object.assign({}, state, { projectOptionsVisible: true });
    case ActionTypes.CLOSE_PROJECT_OPTIONS:
      return Object.assign({}, state, { projectOptionsVisible: false });
    case ActionTypes.SHOW_NEW_FOLDER_MODAL:
      return Object.assign({}, state, { newFolderModalVisible: true });
    case ActionTypes.CLOSE_NEW_FOLDER_MODAL:
      return Object.assign({}, state, { newFolderModalVisible: false });
    default:
      return state;
  }
};

export default ide;
