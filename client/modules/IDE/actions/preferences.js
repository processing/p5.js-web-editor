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

export function updateFont(event) {
  const value = event.target.value;
  return {
    type: ActionTypes.UPDATE_FONTSIZE,
    value
  };
}

export function increaseIndentation() {
  return {
    type: ActionTypes.INCREASE_INDENTATION
  };
}

export function decreaseIndentation() {
  return {
    type: ActionTypes.DECREASE_INDENTATION
  };
}

export function updateIndentation() {
  const value = event.target.value;
  return {
    type: ActionTypes.UPDATE_INDENTATION,
    value
  };
}

export function indentWithTab() {
  return {
    type: ActionTypes.INDENT_WITH_TAB
  };
}

export function indentWithSpace() {
  return {
    type: ActionTypes.INDENT_WITH_SPACE
  };
}
