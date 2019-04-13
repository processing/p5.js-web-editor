import { browserHistory } from 'react-router';
import axios from 'axios';
import * as ActionTypes from '../../constants';
import { showErrorModal, justOpenedProject } from '../IDE/actions/ide';
import { showToast, setToastText } from '../IDE/actions/toast';


const __process = (typeof global !== 'undefined' ? global : window).process;
const ROOT_URL = __process.env.API_URL;

export function authError(error) {
  return {
    type: ActionTypes.AUTH_ERROR,
    payload: error
  };
}

export function signUpUser(previousPath, formValues) {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/signup`, formValues, { withCredentials: true })
      .then((response) => {
        dispatch({
          type: ActionTypes.AUTH_USER,
          user: response.data
        });
        dispatch(justOpenedProject());
        browserHistory.push(previousPath);
      })
      .catch(response => dispatch(authError(response.data.error)));
  };
}

export function loginUser(formValues) {
  return axios.post(`${ROOT_URL}/login`, formValues, { withCredentials: true });
}

export function loginUserSuccess(user) {
  return {
    type: ActionTypes.AUTH_USER,
    user
  };
}

export function loginUserFailure(error) {
  return {
    type: ActionTypes.AUTH_ERROR,
    error
  };
}

export function validateAndLoginUser(previousPath, formProps, dispatch) {
  return new Promise((resolve, reject) => {
    loginUser(formProps)
      .then((response) => {
        dispatch({
          type: ActionTypes.AUTH_USER,
          user: response.data
        });
        dispatch({
          type: ActionTypes.SET_PREFERENCES,
          preferences: response.data.preferences
        });
        dispatch(justOpenedProject());
        browserHistory.push(previousPath);
        resolve();
      })
      .catch((response) => {
        reject({ password: response.data.message, _error: 'Login failed!' }); // eslint-disable-line
      });
  });
}

export function getUser() {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/session`, { withCredentials: true })
      .then((response) => {
        dispatch({
          type: ActionTypes.AUTH_USER,
          user: response.data
        });
        dispatch({
          type: ActionTypes.SET_PREFERENCES,
          preferences: response.data.preferences
        });
      })
      .catch((response) => {
        dispatch(authError(response.data.error));
      });
  };
}

export function validateSession() {
  return (dispatch, getState) => {
    axios.get(`${ROOT_URL}/session`, { withCredentials: true })
      .then((response) => {
        const state = getState();
        if (state.user.username !== response.data.username) {
          dispatch(showErrorModal('staleSession'));
        }
      })
      .catch((response) => {
        if (response.status === 404) {
          dispatch(showErrorModal('staleSession'));
        }
      });
  };
}

export function logoutUser() {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/logout`, { withCredentials: true })
      .then(() => {
        dispatch({
          type: ActionTypes.UNAUTH_USER
        });
      })
      .catch(response => dispatch(authError(response.data.error)));
  };
}

export function initiateResetPassword(formValues) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.RESET_PASSWORD_INITIATE
    });
    axios.post(`${ROOT_URL}/reset-password`, formValues, { withCredentials: true })
      .then(() => {
        // do nothing
      })
      .catch(response => dispatch({
        type: ActionTypes.ERROR,
        message: response.data
      }));
  };
}

export function initiateVerification() {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.EMAIL_VERIFICATION_INITIATE
    });
    axios.post(`${ROOT_URL}/verify/send`, {}, { withCredentials: true })
      .then(() => {
        // do nothing
      })
      .catch(response => dispatch({
        type: ActionTypes.ERROR,
        message: response.data
      }));
  };
}

export function verifyEmailConfirmation(token) {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.EMAIL_VERIFICATION_VERIFY,
      state: 'checking',
    });
    return axios.get(`${ROOT_URL}/verify?t=${token}`, {}, { withCredentials: true })
      .then(response => dispatch({
        type: ActionTypes.EMAIL_VERIFICATION_VERIFIED,
        message: response.data,
      }))
      .catch(response => dispatch({
        type: ActionTypes.EMAIL_VERIFICATION_INVALID,
        message: response.data
      }));
  };
}


export function resetPasswordReset() {
  return {
    type: ActionTypes.RESET_PASSWORD_RESET
  };
}

export function validateResetPasswordToken(token) {
  return (dispatch) => {
    axios.get(`${ROOT_URL}/reset-password/${token}`)
      .then(() => {
        // do nothing if the token is valid
      })
      .catch(() => dispatch({
        type: ActionTypes.INVALID_RESET_PASSWORD_TOKEN
      }));
  };
}

export function updatePassword(token, formValues) {
  return (dispatch) => {
    axios.post(`${ROOT_URL}/reset-password/${token}`, formValues)
      .then((response) => {
        dispatch(loginUserSuccess(response.data));
        browserHistory.push('/');
      })
      .catch(() => dispatch({
        type: ActionTypes.INVALID_RESET_PASSWORD_TOKEN
      }));
  };
}

export function updateSettingsSuccess(user) {
  return {
    type: ActionTypes.SETTINGS_UPDATED,
    user
  };
}

export function updateSettings(formValues) {
  return dispatch =>
    axios.put(`${ROOT_URL}/account`, formValues, { withCredentials: true })
      .then((response) => {
        dispatch(updateSettingsSuccess(response.data));
        browserHistory.push('/');
        dispatch(showToast(5500));
        dispatch(setToastText('Settings saved.'));
      })
      .catch(response => Promise.reject(new Error(response.data.error)));
}
