import * as ActionTypes from '../../../constants';

export function openPreferences() {
  return {
    type: ActionTypes.OPEN_PREFERENCES
  };
}

export function closePreferences() {
  return {
    type: ActionTypes.CLOSE_PREFERENCES
  };
}

export function increaseFont() {
  return {
    type: ActionTypes.INCREASE_FONTSIZE
  };
}

export function decreaseFont() {
  return {
    type: ActionTypes.DECREASE_FONTSIZE
  };
}
