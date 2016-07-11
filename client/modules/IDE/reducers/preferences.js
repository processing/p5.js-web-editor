import * as ActionTypes from '../../../constants';

const initialState = {
  isVisible: false,
  fontSize: 18,
  indentationAmount: 4,
  isTabIndent: true
};

const preferences = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.OPEN_PREFERENCES:
      return Object.assign({}, state, {
        isVisible: true
      });
    case ActionTypes.CLOSE_PREFERENCES:
      return Object.assign({}, state, {
        isVisible: false
      });
    case ActionTypes.INCREASE_FONTSIZE:
      return Object.assign({}, state, {
        fontSize: state.fontSize + 2
      });
    case ActionTypes.DECREASE_FONTSIZE:
      return Object.assign({}, state, {
        fontSize: state.fontSize - 2
      });
    case ActionTypes.UPDATE_FONTSIZE:
      return Object.assign({}, state, {
        fontSize: action.value
      });
    case ActionTypes.INCREASE_INDENTATION:
      return Object.assign({}, state, {
        indentationAmount: state.indentationAmount + 2
      });
    case ActionTypes.DECREASE_INDENTATION:
      return Object.assign({}, state, {
        indentationAmount: state.indentationAmount - 2
      });
    case ActionTypes.UPDATE_INDENTATION:
      return Object.assign({}, state, {
        indentationAmount: action.value
      });
    case ActionTypes.INDENT_WITH_TAB:
      return Object.assign({}, state, {
        isTabIndent: true
      });
    case ActionTypes.INDENT_WITH_SPACE:
      return Object.assign({}, state, {
        isTabIndent: false
      });
    default:
      return state;
  }
};

export default preferences;
