import * as ActionTypes from '../../../constants';

export function updateFile(name, content) {
  return {
    type: ActionTypes.CHANGE_SELECTED_FILE,
    name,
    content
  };
}
