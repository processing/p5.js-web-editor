import * as ActionTypes from '../../../constants';

export function updateFileContent(name, content) {
  return {
    type: ActionTypes.UPDATE_FILE_CONTENT,
    name,
    content
  };
}

// TODO make req to server
export function createFile(name) {
  return {
    type: ActionTypes.CREATE_FILE,
    name
  };
}
