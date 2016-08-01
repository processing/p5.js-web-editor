import * as ActionTypes from '../../../constants';

const initialState = {
  fontSize: 18,
  indentationAmount: 2,
  isTabIndent: true
};

const preferences = (state = initialState, action) => {
  switch (action.type) {
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
        fontSize: parseInt(action.value, 10)
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
        indentationAmount: parseInt(action.value, 10)
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
