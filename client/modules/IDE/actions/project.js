import * as ActionTypes from '../../../constants';
import { browserHistory } from 'react-router';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import blobUtil from 'blob-util';

const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

export function getProjectBlobUrls() {
  return (dispatch, getState) => {
    const state = getState();
    state.files.forEach(file => {
      if (file.url) {
        blobUtil.imgSrcToBlob(file.url, undefined, { crossOrigin: 'Anonymous' })
          .then(blobUtil.createObjectURL)
          .then(objectURL => {
            dispatch({
              type: ActionTypes.SET_BLOB_URL,
              name: file.name,
              blobURL: objectURL
            });
          });
      }
    });
  };
}

export function getProject(id) {
  return (dispatch, getState) => {
    axios.get(`${ROOT_URL}/projects/${id}`, { withCredentials: true })
      .then(response => {
        browserHistory.push(`/projects/${id}`);
        dispatch({
          type: ActionTypes.SET_PROJECT,
          project: response.data,
          files: response.data.files,
          selectedFile: response.data.selectedFile,
          owner: response.data.user
        });
        getProjectBlobUrls()(dispatch, getState);
      })
      .catch(response => dispatch({
        type: ActionTypes.ERROR,
        error: response.data
      }));
  };
}

export function setProjectName(event) {
  const name = event.target.textContent;
  return {
    type: ActionTypes.SET_PROJECT_NAME,
    name
  };
}

export function saveProject() {
  return (dispatch, getState) => {
    const state = getState();
    const formParams = Object.assign({}, state.project);
    formParams.files = [...state.files];
    if (state.project.id) {
      axios.put(`${ROOT_URL}/projects/${state.project.id}`, formParams, { withCredentials: true })
        .then(() => {
          dispatch({
            type: ActionTypes.PROJECT_SAVE_SUCCESS
          });
        })
        .catch((response) => dispatch({
          type: ActionTypes.PROJECT_SAVE_FAIL,
          error: response.data
        }));
    } else {
      // this might be unnecessary, but to prevent collisions in mongodb
      formParams.files.map(file => {
        const newFile = Object.assign({}, file);
        delete newFile.id;
        return newFile;
      });
      axios.post(`${ROOT_URL}/projects`, formParams, { withCredentials: true })
        .then(response => {
          browserHistory.push(`/projects/${response.data.id}`);
          dispatch({
            type: ActionTypes.NEW_PROJECT,
            name: response.data.name,
            id: response.data.id,
            owner: response.data.user,
            selectedFile: response.data.selectedFile,
            files: response.data.files
          });
        })
        .catch(response => dispatch({
          type: ActionTypes.PROJECT_SAVE_FAIL,
          error: response.data
        }));
    }
  };
}


export function createProject() {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/projects`, {}, { withCredentials: true })
      .then(response => {
        browserHistory.push(`/projects/${response.data.id}`);
        dispatch({
          type: ActionTypes.NEW_PROJECT,
          name: response.data.name,
          id: response.data.id,
          owner: response.data.user,
          selectedFile: response.data.selectedFile,
          files: response.data.files
        });
      })
      .catch(response => dispatch({
        type: ActionTypes.PROJECT_SAVE_FAIL,
        error: response.data
      }));
  };
}

export function exportProjectAsZip() {
  return (dispatch, getState) => {
    console.log('exporting project!');
    const state = getState();
    const zip = new JSZip();
    state.files.forEach(file => {
      zip.file(file.name, file.content);
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, `${state.project.name}.zip`);
    });
  };
}

export function cloneProject() {
  return (dispatch, getState) => {
    const state = getState();
    const formParams = Object.assign({}, { name: state.project.name }, { files: state.files });
    axios.post(`${ROOT_URL}/projects`, formParams, { withCredentials: true })
      .then(response => {
        browserHistory.push(`/projects/${response.data.id}`);
        dispatch({
          type: ActionTypes.NEW_PROJECT,
          name: response.data.name,
          id: response.data.id,
          owner: response.data.user,
          selectedFile: response.data.selectedFile,
          files: response.data.files
        });
      })
      .catch(response => dispatch({
        type: ActionTypes.PROJECT_SAVE_FAIL,
        error: response.data
      }));
  };
}

