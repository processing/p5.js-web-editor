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
 *    dispatch(showToast(6000));
 * And also supports proposed single-action syntax with message and optional timeout.
 *    dispatch(showToast('Toast.SketchFailedSave'));
 *    dispatch(showToast('Toast.SketchSaved', 6000));
 */
export function showToast(textOrTime, timeout = 6000) {
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
