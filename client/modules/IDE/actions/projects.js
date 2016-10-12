import * as ActionTypes from '../../../constants';
import { browserHistory } from 'react-router';
import axios from 'axios';

const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

export function getProjects(username) {
  return (dispatch) => {
    let url;
    if (username) {
      url = `${ROOT_URL}/${username}/projects`;
    } else {
      url = `${ROOT_URL}/projects`;
    }
    axios.get(url, { withCredentials: true })
      .then(response => {
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

export function closeSketchList() {
  browserHistory.goBack();
}

export function deleteProject(id) {
  return (dispatch) => {
    axios.delete(`${ROOT_URL}/projects/${id}`, { withCredentials: true })
      .then(() => {
        dispatch({
          type: ActionTypes.DELETE_PROJECT,
          id
        });
      });
  };
}
