import * as ActionTypes from '../../../constants';
import { browserHistory } from 'react-router';
import axios from 'axios';

const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

export function getProjects() {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/projects`, { withCredentials: true })
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
  browserHistory.push('/');
}
