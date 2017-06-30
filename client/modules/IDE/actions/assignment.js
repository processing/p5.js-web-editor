import axios from 'axios';
import * as ActionTypes from '../../../constants';
import { showErrorModal, setPreviousPath } from './ide';
import { resetProject } from './project';

const ROOT_URL = process.env.API_URL;

export function getAssignment(id) {
  return (dispatch, getState) => {
    // dispatch(justOpenedProject());
    axios.get(`${ROOT_URL}/classrooms/${id}`, { withCredentials: true })
      .then((response) => {
        console.log(response);
        // dispatch(setClassoom(response.data));
        // dispatch(setUnsavedChanges(false));
      })
      .catch(response => dispatch({
        type: ActionTypes.ERROR,
        error: response.data
      }));
  };
}

export function getAssignments(classroomid) {
  console.log('getAssignments');

  return (dispatch) => {
    const url = `${ROOT_URL}/assignment/${classroomid}`;
    console.log(url);
    axios.get(url, { withCredentials: true })
      .then((response) => {
        console.log('data: ');
        console.log(response.data);
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

export function deleteAssignment(id) {
  return (dispatch, getState) => {
    axios.delete(`${ROOT_URL}/projects/${id}`, { withCredentials: true })
      .then(() => {
        const state = getState();
        if (id === state.project.id) {
          dispatch(resetProject());
          dispatch(setPreviousPath('/'));
        }
        dispatch({
          type: ActionTypes.DELETE_PROJECT,
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

export function createNewAssignment() {
  return (dispatch, getState) => {
    axios.post(`${ROOT_URL}/classrooms`, {}, { withCredentials: true })
      .then((response) => {
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
        console.log(response);
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
