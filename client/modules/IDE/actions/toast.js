import * as ActionTypes from '../../../constants';

export function hideToast() {
  return {
    type: ActionTypes.HIDE_TOAST
  };
}

/**
 * Temporary fix until #2206 is merged.
 * Supports legacy two-action syntax:
 *    dispatch(setToastText('Toast.SketchFailedSave'));
 *    dispatch(showToast(1500));
 * And also supports proposed single-action syntax with message and optional timeout.
 *    dispatch(showToast('Toast.SketchFailedSave'));
 *    dispatch(showToast('Toast.SketchSaved', 5500));
 */
export function showToast(textOrTime, timeout = 1500) {
  return (dispatch) => {
    let time = timeout;
    if (typeof textOrTime === 'string') {
      // eslint-disable-next-line no-use-before-define
      dispatch(setToastText(textOrTime));
    } else {
      time = textOrTime;
    }
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
