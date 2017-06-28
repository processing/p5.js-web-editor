import axios from 'axios';
import * as ActionTypes from '../../../constants';
import { showErrorModal, setPreviousPath } from './ide';
import { resetProject } from './project';

const ROOT_URL = process.env.API_URL;

export function getClassroom(id) {
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

export function getClassrooms(username) {
  console.log('getClassrooms');

  return (dispatch) => {
    let url;
    if (username) {
      url = `${ROOT_URL}/${username}/classrooms`;
    } else {
      url = `${ROOT_URL}/classrooms`;
    }
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

export function deleteClassroom(id) {
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

export function createNewClassroom() {
  return (dispatch, getState) => {
    axios.post(`${ROOT_URL}/classrooms`, {}, { withCredentials: true })
      .then((response) => {
        // dispatch(showErrorModal('staleSession'));
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
