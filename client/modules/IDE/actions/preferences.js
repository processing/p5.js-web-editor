import * as ActionTypes from '../../../constants';
// import axios from 'axios';

// const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

export function setFontSize(value) {
  return {
    type: ActionTypes.SET_FONT_SIZE,
    value
  };
}

export function setIndentation(value) {
  return {
    type: ActionTypes.SET_INDENTATION,
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
