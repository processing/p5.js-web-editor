import axios from 'axios';
import { browserHistory } from 'react-router';
import * as ActionTypes from '../../../constants';
import { resetProject } from './project';
import { setUnsavedChanges,
  justOpenedProject,
  resetJustOpenedProject,
  showErrorModal,
  setPreviousPath } from './ide';

const ROOT_URL = process.env.API_URL;

export function getClassroom(id) {
  return (dispatch, getState) => {
    dispatch(justOpenedProject());
    axios.get(`${ROOT_URL}/classrooms/${id}`, { withCredentials: true })
      .then((response) => {
        dispatch({
          type: ActionTypes.SET_CLASSROOM,
          classroom: response.data
        });
        dispatch(setUnsavedChanges(false));
      })
      .catch(response => dispatch({
        type: ActionTypes.ERROR,
        error: response.data
      }));
  };
}

export function getClassrooms(username) {
  return (dispatch) => {
    let url;
    if (username) {
      url = `${ROOT_URL}/${username}/classrooms`;
    } else {
      url = `${ROOT_URL}/classrooms`;
    }
    axios.get(url, { withCredentials: true })
      .then((response) => {
        dispatch({
          type: ActionTypes.SET_CLASSROOMS,
          classrooms: response.data
        });
      })
      .catch(response => dispatch({
        type: ActionTypes.ERROR,
        error: response.data
      }));
  };
}

export function deleteClassroom(id) {
  return (dispatch, getState) => {
    axios.delete(`${ROOT_URL}/classrooms/${id}`, { withCredentials: true })
      .then(() => {
        const state = getState();
        if (id === state.project.id) {
          dispatch(resetProject());
          dispatch(setPreviousPath('/'));
        }
        dispatch({
          type: ActionTypes.DELETE_CLASSROOM,
          id
        });
      })
      .catch((response) => {
        if (response.status === 403) {
          dispatch(showErrorModal('staleSession'));
        } else {
          dispatch({
            type: ActionTypes.ERROR,
            error: response.data
          });
        }
      });
  };
}

export function createNewClassroom() {
  return (dispatch, getState) => {
    axios.post(`${ROOT_URL}/classrooms`, {}, { withCredentials: true })
      .then((response) => {
        dispatch({
          type: ActionTypes.SET_CLASSROOM,
          classroom: response.data
        });
        console.log(response.data);
        browserHistory.push(`/classroom/${response.data._id}`);
        /* dispatch(setUnsavedChanges(false));
        dispatch(setProject(response.data));
        browserHistory.push(`/${response.data.user.username}/sketches/${response.data.id}`);
        dispatch({
          type: ActionTypes.NEW_PROJECT,
          project: response.data,
          owner: response.data.user,
          files: response.data.files
        }); */
      })
      .catch((response) => {
        /* if (response.status === 403) {
          dispatch(showErrorModal('staleSession'));
        } else {
          dispatch({
            type: ActionTypes.PROJECT_SAVE_FAIL,
            error: response.data
          });
        } */
      });
  };
}

export function saveClassroom() {
  return (dispatch, getState) => {
    const state = getState();
    /* if (state.user.id && state.class.owner && state.project.owner.id !== state.user.id) {
      return Promise.reject();
    }*/
    const formParams = Object.assign({}, state.classroom);
    console.log(formParams);
    // formParams.files = [...state.files];
    // if (state.classroom.id) {
    return axios.put(`${ROOT_URL}/classrooms/${state.classroom._id}`, formParams, { withCredentials: true })
      .then((response) => {
        console.log(response);
        dispatch(setUnsavedChanges(false));
        dispatch({
          type: ActionTypes.SET_CLASSROOM,
          classroom: response.data
        });
        dispatch({
          type: ActionTypes.CLASSROOM_SAVE_SUCCESS
        });
      })
      .catch((response) => {
        console.log(response);
        if (response.status === 403) {
          dispatch(showErrorModal('staleSession'));
        } else if (response.status === 409) {
          dispatch(showErrorModal('staleProject'));
        } else {
          dispatch({
            type: ActionTypes.CLASSROOM_SAVE_FAIL,
            error: response.data
          });
        }
      });
    // }

    /* return axios.post(`${ROOT_URL}/projects`, formParams, { withCredentials: true })
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
      }); */
  };
}

export function getSubmissions(classroom, assignment) {
  console.log('getSubmissions');
  return (dispatch) => {
    const url = `${ROOT_URL}/classroom/${classroom._id}/${assignment._id}/projects`;
    axios.get(url, { withCredentials: true })
      .then((response) => {
        console.log(response.data);
        dispatch({
          type: ActionTypes.SET_PROJECTS,
          projects: response.data
        });
      })
      .catch(response => dispatch({
        type: ActionTypes.ERROR,
        error: response.data
      }));
  };
}

export function setAssignment(assignment) {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.SET_ASSIGNMENT,
      assignment
    });
  };
}

export function updateClassroom(formParams) {
  return (dispatch, getState) => {
    const state = getState();
    return axios.put(`${ROOT_URL}/classrooms/${state.classroom._id}`, formParams, { withCredentials: true })
      .then((response) => {
        dispatch(setUnsavedChanges(false));
        dispatch({
          type: ActionTypes.SET_CLASSROOM,
          classroom: response.data
        });
        dispatch({
          type: ActionTypes.CLASSROOM_SAVE_SUCCESS
        });
        browserHistory.push(`/classroom/${state.classroom._id}`);
      })
      .catch((response) => {
        if (response.status === 403) {
          dispatch(showErrorModal('staleSession'));
        } else if (response.status === 409) {
          dispatch(showErrorModal('staleProject'));
        } else {
          dispatch({
            type: ActionTypes.CLASSROOM_SAVE_FAIL,
            error: response.data
          });
        }
      });
  };
}

