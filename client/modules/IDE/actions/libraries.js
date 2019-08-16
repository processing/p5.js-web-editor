import axios from 'axios';
import * as ActionTypes from '../../../constants';

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
    const postBody = { name, url };
    axios.put(`${ROOT_URL}/projects/${projectId}/libraries`, postBody, { withCredentials: true })
      .then((response) => {
        dispatch(addLibrary(name, url));
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
