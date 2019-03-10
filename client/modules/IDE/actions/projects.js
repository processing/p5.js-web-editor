import axios from 'axios';
import * as ActionTypes from '../../../constants';
import { showErrorModal, setPreviousPath } from './ide';
import { resetProject } from './project';
import { store } from '../../../index';

const __process = (typeof global !== 'undefined' ? global : window).process;
const ROOT_URL = __process.env.API_URL;

export function getProjects(username) {
  return (dispatch) => {
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
      })
      .catch(response => dispatch({
        type: ActionTypes.ERROR,
        error: response.data
      }));
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


export function sort(orderType, orderBy) {
  const type = `SORT_${orderType}_${orderBy}`;
  return () => store.dispatch({ type });
}
