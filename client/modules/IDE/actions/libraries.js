import axios from 'axios';
import * as ActionTypes from '../../../constants';
import { insertLibrary } from '../../../utils/domParser';
import { updateFileContent } from './files';

const __process = (typeof global !== 'undefined' ? global : window).process;
const ROOT_URL = __process.env.API_URL;

export function addLibrary(name, url) {
  return {
    type: ActionTypes.ADD_LIBRARY,
    library: {
      name,
      url
    }
  };
}

export function addLibraryRequest(name, url) {
  return (dispatch, getState) => {
    const state = getState();
    const projectId = state.project.id;
    const indexFile = state.files.find(file => file.name === 'index.html');
    let updatedIndexFile;
    if (indexFile) {
      updatedIndexFile = insertLibrary(indexFile.content, url);
    }
    if (!projectId) {
      dispatch(addLibrary(name, url));
      dispatch(updateFileContent(indexFile.id, updatedIndexFile));
      return;
    }
    const postBody = { name, url, indexFile: { id: indexFile.id, content: updatedIndexFile } };
    axios.put(`${ROOT_URL}/projects/${projectId}/libraries`, postBody, { withCredentials: true })
      .then((response) => {
        dispatch(addLibrary(name, url));
        dispatch(updateFileContent(indexFile.id, updatedIndexFile));
      })
      .catch((response) => {
        // TODO handle error
      });
  };
}

// function removeLibrary(name) {

// }

// function resetLibraries() {

// }
