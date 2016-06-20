import * as ActionTypes from '../constants/constants'
import { browserHistory } from 'react-router'
import axios from 'axios'


const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

export function signUpUser(formValues) {
  return function(dispatch) {
    axios.post(`${ROOT_URL}/signup`, formValues, {withCredentials: true})
      .then(response => {
        dispatch({ type: ActionTypes.AUTH_USER,
                    user: response.data
        });
        browserHistory.push('/');
      })
      .catch(response => dispatch(authError(response.data.error)));
  }
}

export function loginUser(formValues) {
  return function(dispatch) {
    axios.post(`${ROOT_URL}/login`, formValues, {withCredentials: true})
      .then(response => {
        dispatch({ type: ActionTypes.AUTH_USER,
                    user: response.data
        });
        browserHistory.push('/');
      })
      .catch(response => dispatch(authError(response.data.error)));
  }
}

export function getUser() {
  return function(dispatch) {
    axios.get(`${ROOT_URL}/session`, {withCredentials: true})
      .then(response => {
        dispatch({type: ActionTypes.AUTH_USER,
          user: response.data
        });
      })
      .catch(response => dispatch(authError(response.data.error)));
  }
}

export function authError(error) {
  return {
    type: ActionTypes.AUTH_ERROR,
    payload: error
  };
}