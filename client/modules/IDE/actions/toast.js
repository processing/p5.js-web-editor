import * as ActionTypes from '../../../constants';

export function hideToast() {
  return {
    type: ActionTypes.HIDE_TOAST
  };
}

export function showToast() {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.SHOW_TOAST
    });
    setTimeout(() => dispatch(hideToast()), 1500);
  };
}

export function setToastText(text) {
  return {
    type: ActionTypes.SET_TOAST_TEXT,
    text
  };
}
