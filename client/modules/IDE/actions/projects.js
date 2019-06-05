import axios from 'axios';
import * as ActionTypes from '../../../constants';
import { showErrorModal, setPreviousPath } from './ide';
import { resetProject } from './project';
import { startLoader, stopLoader } from './loader';

const __process = (typeof global !== 'undefined' ? global : window).process;
const ROOT_URL = __process.env.API_URL;

export function getProjects(username) {
  return (dispatch) => {
    dispatch(startLoader());
    let url;
    if (username) {
      url = `${ROOT_URL}/${username}/projects`;
    } else {
      url = `${ROOT_URL}/projects`;
    }
    axios.get(url, { withCredentials: true })
      .then((response) => {
        dispatch({
          type: ActionTypes.SET_PROJECTS,
          projects: response.data
        });
        dispatch(stopLoader());
      })
      .catch((response) => {
        dispatch({
          type: ActionTypes.ERROR,
          error: response.data
        });
        dispatch(stopLoader());
      });
  };
}

export function deleteProject(id) {
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
