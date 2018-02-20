import { browserHistory } from 'react-router';
import axios from 'axios';
import objectID from 'bson-objectid';
import each from 'async/each';
import { isEqual } from 'lodash';
import * as ActionTypes from '../../../constants';
import { showToast, setToastText } from './toast';
import { setUnsavedChanges,
  justOpenedProject,
  resetJustOpenedProject,
  showErrorModal } from './ide';
import { clearState, saveState } from '../../../persistState';
import { redirectToProtocol, protocols } from '../../../components/forceProtocol';

const ROOT_URL = process.env.API_URL;

export function setProject(project) {
  const targetProtocol = project.serveSecure === true ?
    protocols.https :
    protocols.http;

  // This will not reload if on same protocol
  redirectToProtocol(targetProtocol);

  return {
    type: ActionTypes.SET_PROJECT,
    project,
    files: project.files,
    owner: project.user
  };
}

export function setProjectName(name) {
  return {
    type: ActionTypes.SET_PROJECT_NAME,
    name
  };
}

export function getProject(id) {
  return (dispatch, getState) => {
    dispatch(justOpenedProject());
    axios.get(`${ROOT_URL}/projects/${id}`, { withCredentials: true })
      .then((response) => {
        dispatch(setProject(response.data));
        dispatch(setUnsavedChanges(false));
      })
      .catch(response => dispatch({
        type: ActionTypes.ERROR,
        error: response.data
      }));
  };
}

export function persistState() {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.PERSIST_STATE,
    });
    const state = getState();
    saveState(state);
  };
}

export function clearPersistedState() {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.CLEAR_PERSISTED_STATE,
    });
    clearState();
  };
}

export function saveProject(autosave = false) {
  return (dispatch, getState) => {
    const state = getState();
    if (state.user.id && state.project.owner && state.project.owner.id !== state.user.id) {
      return Promise.reject();
    }
    const formParams = Object.assign({}, state.project);
    formParams.files = [...state.files];
    if (state.project.id) {
      return axios.put(`${ROOT_URL}/projects/${state.project.id}`, formParams, { withCredentials: true })
        .then((response) => {
          const currentState = getState();
          const savedProject = Object.assign({}, response.data);
          if (!isEqual(currentState.files, response.data.files)) {
            savedProject.files = currentState.files;
            dispatch(setUnsavedChanges(true));
          } else {
            dispatch(setUnsavedChanges(false));
          }
          dispatch(setProject(savedProject));
          dispatch({
            type: ActionTypes.PROJECT_SAVE_SUCCESS
          });
          if (!autosave) {
            if (state.ide.justOpenedProject && state.preferences.autosave) {
              dispatch(showToast(5500));
              dispatch(setToastText('Project saved.'));
              setTimeout(() => dispatch(setToastText('Autosave enabled.')), 1500);
              dispatch(resetJustOpenedProject());
            } else {
              dispatch(showToast(1500));
              dispatch(setToastText('Project saved.'));
            }
          }
        })
        .catch((response) => {
          if (response.status === 403) {
            dispatch(showErrorModal('staleSession'));
          } else if (response.status === 409) {
            dispatch(showErrorModal('staleProject'));
          } else {
            dispatch({
              type: ActionTypes.PROJECT_SAVE_FAIL,
              error: response.data
            });
          }
        });
    }

    return axios.post(`${ROOT_URL}/projects`, formParams, { withCredentials: true })
      .then((response) => {
        dispatch(setUnsavedChanges(false));
        dispatch(setProject(response.data));
        browserHistory.push(`/${response.data.user.username}/sketches/${response.data.id}`);
        dispatch({
          type: ActionTypes.NEW_PROJECT,
          project: response.data,
          owner: response.data.user,
          files: response.data.files
        });
        if (!autosave) {
          if (state.preferences.autosave) {
            dispatch(showToast(5500));
            dispatch(setToastText('Project saved.'));
            setTimeout(() => dispatch(setToastText('Autosave enabled.')), 1500);
            dispatch(resetJustOpenedProject());
          } else {
            dispatch(showToast(1500));
            dispatch(setToastText('Project saved.'));
          }
        }
      })
      .catch((response) => {
        if (response.status === 403) {
          dispatch(showErrorModal('staleSession'));
        } else {
          dispatch({
            type: ActionTypes.PROJECT_SAVE_FAIL,
            error: response.data
          });
        }
      });
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
      .then((response) => {
        browserHistory.push(`/${response.data.user.username}/sketches/${response.data.id}`);
        dispatch({
          type: ActionTypes.NEW_PROJECT,
          project: response.data,
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

export function exportProjectAsZip(projectId) {
  const win = window.open(`${ROOT_URL}/projects/${projectId}/zip`, '_blank');
  win.focus();
}

export function resetProject() {
  return {
    type: ActionTypes.RESET_PROJECT
  };
}

export function newProject() {
  setTimeout(() => {
    browserHistory.push('/');
  }, 0);
  return resetProject();
}

function generateNewIdsForChildren(file, files) {
  const newChildren = [];
  file.children.forEach((childId) => {
    const child = files.find(childFile => childFile.id === childId);
    const newId = objectID().toHexString();
    child.id = newId;
    child._id = newId;
    newChildren.push(newId);
    generateNewIdsForChildren(child, files);
  });
  file.children = newChildren; // eslint-disable-line
}

export function cloneProject() {
  return (dispatch, getState) => {
    dispatch(setUnsavedChanges(false));
    const state = getState();
    const newFiles = state.files.map((file) => { // eslint-disable-line
      return { ...file };
    });

    // generate new IDS for all files
    const rootFile = newFiles.find(file => file.name === 'root');
    const newRootFileId = objectID().toHexString();
    rootFile.id = newRootFileId;
    rootFile._id = newRootFileId;
    generateNewIdsForChildren(rootFile, newFiles);

    // duplicate all files hosted on S3
    each(newFiles, (file, callback) => {
      if (file.url && file.url.includes('amazonaws')) {
        const formParams = {
          url: file.url
        };
        axios.post(`${ROOT_URL}/S3/copy`, formParams, { withCredentials: true })
          .then((response) => {
            file.url = response.data.url;
            callback(null);
          });
      } else {
        callback(null);
      }
    }, (err) => {
      // if not errors in duplicating the files on S3, then duplicate it
      const formParams = Object.assign({}, { name: `${state.project.name} copy` }, { files: newFiles });
      axios.post(`${ROOT_URL}/projects`, formParams, { withCredentials: true })
        .then((response) => {
          browserHistory.push(`/${response.data.user.username}/sketches/${response.data.id}`);
          console.log(response.data);
          dispatch({
            type: ActionTypes.NEW_PROJECT,
            project: response.data,
            owner: response.data.user,
            files: response.data.files
          });
        })
        .catch(response => dispatch({
          type: ActionTypes.PROJECT_SAVE_FAIL,
          error: response.data
        }));
    });
  };
}

export function setServeSecure(serveSecure, { redirect = true } = {}) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.SET_SERVE_SECURE,
      serveSecure
    });

    if (redirect === true) {
      dispatch(saveProject(false /* autosave */))
        .then(
          () => redirectToProtocol(serveSecure === true ? protocols.https : protocols.http)
        );
    }

    return null;
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
