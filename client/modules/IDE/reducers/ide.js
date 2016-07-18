import * as ActionTypes from '../../../constants';

const initialState = {
  isPlaying: false,
  selectedFile: '1',
  consoleEvent: {
    method: undefined,
    arguments: []
  },
  modalIsVisible: false,
  sidebarIsExpanded: true
};

const ide = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.TOGGLE_SKETCH:
      return Object.assign({}, state, { isPlaying: !state.isPlaying });
    case ActionTypes.START_SKETCH:
      return Object.assign({}, state, { isPlaying: true });
    case ActionTypes.STOP_SKETCH:
      return Object.assign({}, state, { isPlaying: false });
    case ActionTypes.SET_SELECTED_FILE:
    case ActionTypes.SET_PROJECT:
    case ActionTypes.NEW_PROJECT:
      return Object.assign({}, state, { selectedFile: action.selectedFile });
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
    default:
      return state;
  }
};

export default ide;
