import * as ActionTypes from '../../../constants';
import { browserHistory } from 'react-router';
import axios from 'axios';
import { showToast, setToastText } from './toast';
import { setUnsavedChanges, justOpenedProject, resetJustOpenedProject, setProjectSavedTime, resetProjectSavedTime } from './ide';
import moment from 'moment';

const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

export function getProject(id) {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(justOpenedProject());
    if (state.ide.justOpenedProject) {
      dispatch(resetProjectSavedTime());
    }
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
          dispatch(setProjectSavedTime(moment().format()));
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
        .catch((response) => dispatch({
          type: ActionTypes.PROJECT_SAVE_FAIL,
          error: response.data
        }));
    } else {
      axios.post(`${ROOT_URL}/projects`, formParams, { withCredentials: true })
        .then(response => {
          dispatch(setUnsavedChanges(false));
          dispatch(setProjectSavedTime(moment().format()));
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
              dispatch(resetJustOpenedProject());
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
  browserHistory.push('/');
  return resetProject();
}

export function cloneProject() {
  return (dispatch, getState) => {
    const state = getState();
    const formParams = Object.assign({}, { name: `${state.project.name} copy` }, { files: state.files });
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

