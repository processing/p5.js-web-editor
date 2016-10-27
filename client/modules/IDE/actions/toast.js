import * as ActionTypes from '../../../constants';

export function hideToast() {
  return {
    type: ActionTypes.HIDE_TOAST
  };
}

export function showToast(time) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.SHOW_TOAST
    });
    setTimeout(() => dispatch(hideToast()), time);
  };
}

export function setToastText(text) {
  return {
    type: ActionTypes.SET_TOAST_TEXT,
    text
  };
}
