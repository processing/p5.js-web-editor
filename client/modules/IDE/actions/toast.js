import { setToast, hideToast } from '../reducers/toast';

export { hideToast } from '../reducers/toast';

export const TOAST_DISPLAY_TIME_MS = 1500;

export const showToast = (text, timeout = TOAST_DISPLAY_TIME_MS) => (
  dispatch
) => {
  dispatch(setToast(text));
  setTimeout(() => dispatch(hideToast()), timeout);
};
