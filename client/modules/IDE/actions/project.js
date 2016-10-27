import * as ActionTypes from '../../../constants';
import { browserHistory } from 'react-router';
import axios from 'axios';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import { saveAs } from 'file-saver';
import { showToast, setToastText } from './toast';
import { setUnsavedChanges, justOpenProject, resetJustOpenProject } from './ide';

const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

export function getProject(id) {
  return (dispatch) => {
    dispatch(justOpenProject());
    axios.get(`${ROOT_URL}/projects/${id}`, { withCredentials: true })
      .then(response => {
        // browserHistory.push(`/projects/${id}`);
        dispatch({
          type: ActionTypes.SET_PROJECT,
          project: response.data,
          files: response.data.files,
          owner: response.data.user
        });
        dispatch(setUnsavedChanges(false));
      })
      .catch(response => dispatch({
        type: ActionTypes.ERROR,
        error: response.data
      }));
  };
}

export function setProjectName(name) {
  return {
    type: ActionTypes.SET_PROJECT_NAME,
    name
  };
}

export function saveProject(autosave = false) {
  return (dispatch, getState) => {
    const state = getState();
    if (state.user.id && state.project.owner && state.project.owner.id !== state.user.id) {
      return;
    }
    const formParams = Object.assign({}, state.project);
    formParams.files = [...state.files];
    if (state.project.id) {
      axios.put(`${ROOT_URL}/projects/${state.project.id}`, formParams, { withCredentials: true })
        .then(() => {
          dispatch(setUnsavedChanges(false));
          dispatch({
            type: ActionTypes.PROJECT_SAVE_SUCCESS
          });
          if (!autosave) {
            if (state.ide.projectJustOpened && state.preferences.autosave) {
              dispatch(showToast(5500));
              dispatch(setToastText('Project saved.'));
              setTimeout(() => dispatch(setToastText('Autosave enabled.')), 1500);
              dispatch(resetJustOpenProject());
            } else {
              dispatch(showToast(1500));
              dispatch(setToastText('Project saved.'));
            }
          }
        })
        .catch((response) => dispatch({
          type: ActionTypes.PROJECT_SAVE_FAIL,
          error: response.data
        }));
    } else {
      axios.post(`${ROOT_URL}/projects`, formParams, { withCredentials: true })
        .then(response => {
          dispatch(setUnsavedChanges(false));
          browserHistory.push(`/projects/${response.data.id}`);
          dispatch({
            type: ActionTypes.NEW_PROJECT,
            name: response.data.name,
            id: response.data.id,
            owner: response.data.user,
            files: response.data.files
          });
          if (!autosave) {
            if (state.preferences.autosave) {
              dispatch(showToast(5500));
              dispatch(setToastText('Project saved.'));
              setTimeout(() => dispatch(setToastText('Autosave enabled.')), 1500);
              dispatch(resetJustOpenProject());
            } else {
              dispatch(showToast(1500));
              dispatch(setToastText('Project saved.'));
            }
          }
        })
        .catch(response => dispatch({
          type: ActionTypes.PROJECT_SAVE_FAIL,
          error: response.data
        }));
    }
  };
}

export function autosaveProject() {
  return (dispatch, getState) => {
    saveProject(true)(dispatch, getState);
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
          files: response.data.files
        });
        dispatch(setUnsavedChanges(false));
      })
      .catch(response => dispatch({
        type: ActionTypes.PROJECT_SAVE_FAIL,
        error: response.data
      }));
  };
}

function buildZip(state) {
  const zip = new JSZip();
  const rootFile = state.files.find(file => file.name === 'root');
  const numFiles = state.files.filter(file => file.fileType !== 'folder').length;
  const files = state.files;
  const projectName = state.project.name;
  let numCompletedFiles = 0;

  function addFileToZip(file, path) {
    if (file.fileType === 'folder') {
      const newPath = file.name === 'root' ? path : `${path}${file.name}/`;
      file.children.forEach(fileId => {
        const childFile = files.find(f => f.id === fileId);
        (() => {
          addFileToZip(childFile, newPath);
        })();
      });
    } else {
      if (file.url) {
        JSZipUtils.getBinaryContent(file.url, (err, data) => {
          zip.file(`${path}${file.name}`, data, { binary: true });
          numCompletedFiles += 1;
          if (numCompletedFiles === numFiles) {
            zip.generateAsync({ type: 'blob' }).then((content) => {
              saveAs(content, `${projectName}.zip`);
            });
          }
        });
      } else {
        zip.file(`${path}${file.name}`, file.content);
        numCompletedFiles += 1;
        if (numCompletedFiles === numFiles) {
          zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, `${projectName}.zip`);
          });
        }
      }
    }
  }
  addFileToZip(rootFile, '/');
}

export function exportProjectAsZip() {
  return (dispatch, getState) => {
    const state = getState();
    buildZip(state);
  };
}

export function newProject() {
  browserHistory.push('/');
  return {
    type: ActionTypes.RESET_PROJECT
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

export function showEditProjectName() {
  return {
    type: ActionTypes.SHOW_EDIT_PROJECT_NAME
  };
}

export function hideEditProjectName() {
  return {
    type: ActionTypes.HIDE_EDIT_PROJECT_NAME
  };
}

