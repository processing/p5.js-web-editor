import * as ActionTypes from '../../../constants';

export function updateFile(name, content) {
  return {
    type: ActionTypes.UPDATE_FILE,
    name,
    content
  };
}
