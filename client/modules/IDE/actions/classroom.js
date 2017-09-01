import axios from 'axios';
import { browserHistory } from 'react-router';
import * as ActionTypes from '../../../constants';
import { setUnsavedChanges,
  justOpenedProject,
  showErrorModal } from './ide';

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
      })
      .catch((response) => {
        if (response.status === 403) {
          dispatch(showErrorModal('staleSession'));
        } else {
          dispatch({
            type: ActionTypes.CLASSROOM_SAVE_FAIL,
            error: response.data
          });
        }
      });
  };
}

export function saveClassroom() {
  return (dispatch, getState) => {
    const state = getState();
    let isOwner = false;
    state.classroom.instructors.forEach((instructor) => {
      if (instructor.username === state.user.username) {
        isOwner = true;
      }
    });
    if (!isOwner) {
      return Promise.reject();
    }
    const formParams = Object.assign({}, state.classroom);
    return axios.put(`${ROOT_URL}/classrooms/${state.classroom.id}`, formParams, { withCredentials: true })
      .then((response) => {
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
        if (response.status === 403) {
          dispatch(showErrorModal('staleSession'));
        } else {
          dispatch({
            type: ActionTypes.CLASSROOM_SAVE_FAIL,
            error: response.data
          });
        }
      });
  };
}

export function getSubmissions(classroom, assignment) {
  return (dispatch) => {
    const url = `${ROOT_URL}/classrooms/${classroom.id}/${assignment.id}/projects`;
    axios.get(url, { withCredentials: true })
      .then((response) => {
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

export function updateClassroom() {
  return (dispatch, getState) => {
    const state = getState();
    const formParams = Object.assign({}, state.classroom);
    return axios.put(`${ROOT_URL}/classrooms/${state.classroom.id}`, formParams, { withCredentials: true })
      .then((response) => {
        dispatch(setUnsavedChanges(false));
        dispatch({
          type: ActionTypes.SET_CLASSROOM,
          classroom: response.data
        });
        dispatch({
          type: ActionTypes.CLASSROOM_SAVE_SUCCESS
        });
        browserHistory.push(`/classrooms/${state.classroom.id}`);
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

