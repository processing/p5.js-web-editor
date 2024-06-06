import { FORM_ERROR } from 'final-form';
import * as ActionTypes from '../../constants';
import browserHistory from '../../browserHistory';
import apiClient from '../../utils/apiClient';
import { showErrorModal, justOpenedProject } from '../IDE/actions/ide';
import { setLanguage } from '../IDE/actions/preferences';
import { showToast, setToastText } from '../IDE/actions/toast';

import { userActions } from './reducers';

const {
  authUser,
  unauthUser,
  resetPasswordInitiate,
  emailVerificationInitiate,
  emailVerificationVerify,
  emailVerificationVerified,
  emailVerificationInvalid,
  invalidResetPasswordToken,
  apiKeyRemoved,
  setCookieConsent
} = userActions;

export const {
  authError,
  resetPasswordReset,
  settingsUpdated,
  apiKeyCreated
} = userActions;

export function signUpUser(formValues) {
  return apiClient.post('/signup', formValues);
}

export function loginUser(formValues) {
  return apiClient.post('/login', formValues);
}

export function loginUserFailure(error) {
  return {
    type: ActionTypes.AUTH_ERROR,
    error
  };
}

export function setPreferences(preferences) {
  return {
    type: ActionTypes.SET_PREFERENCES,
    preferences
  };
}

export function validateAndLoginUser(formProps) {
  return (dispatch, getState) => {
    const state = getState();
    const { previousPath } = state.ide;
    return new Promise((resolve) => {
      loginUser(formProps)
        .then((response) => {
          dispatch(authUser(response.data));
          dispatch(setPreferences(response.data.preferences));
          dispatch(
            setLanguage(response.data.preferences.language, {
              persistPreference: false
            })
          );
          dispatch(justOpenedProject());
          browserHistory.push(previousPath);
          resolve();
        })
        .catch((error) =>
          resolve({
            [FORM_ERROR]: error.response.data.message
          })
        );
    });
  };
}

export function validateAndSignUpUser(formValues) {
  return (dispatch, getState) => {
    const state = getState();
    const { previousPath } = state.ide;
    return new Promise((resolve) => {
      signUpUser(formValues)
        .then((response) => {
          dispatch(authUser(response.data));
          dispatch(justOpenedProject());
          browserHistory.push(previousPath);
          resolve();
        })
        .catch((error) => {
          const { response } = error;
          dispatch(authError(response.data.error));
          resolve({ error });
        });
    });
  };
}

export function getUser() {
  return async (dispatch) => {
    try {
      const response = await apiClient.get('/session');
      const { data } = response;

      if (data?.user === null) {
        return;
      }

      dispatch(authUser(data));
      dispatch({
        type: ActionTypes.SET_PREFERENCES,
        preferences: data.preferences
      });
      setLanguage(data.preferences.language, { persistPreference: false });
    } catch (error) {
      const message = error.response
        ? error.response.data.error || error.response.message
        : 'Unknown error.';
      dispatch(authError(message));
    }
  };
}

export function validateSession() {
  return async (dispatch, getState) => {
    try {
      const response = await apiClient.get('/session');
      const state = getState();

      if (state.user.username !== response.data.username) {
        dispatch(showErrorModal('staleSession'));
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        dispatch(showErrorModal('staleSession'));
      }
    }
  };
}

export function resetProject(dispatch) {
  dispatch({
    type: ActionTypes.RESET_PROJECT
  });
  dispatch({
    type: ActionTypes.CLEAR_CONSOLE
  });
  browserHistory.push('/');
}

export function logoutUser() {
  return (dispatch) => {
    apiClient
      .get('/logout')
      .then(() => {
        dispatch(unauthUser());
        resetProject(dispatch);
      })
      .catch((error) => {
        const { response } = error;
        dispatch(authError(response.data.error));
      });
  };
}

export function initiateResetPassword(formValues) {
  return (dispatch) =>
    new Promise((resolve) => {
      dispatch(resetPasswordInitiate());
      return apiClient
        .post('/reset-password', formValues)
        .then(() => resolve())
        .catch((error) => {
          const { response } = error;
          dispatch({
            type: ActionTypes.ERROR,
            message: response.data
          });
          resolve({ error });
        });
    });
}

export function initiateVerification() {
  return (dispatch) => {
    dispatch(emailVerificationInitiate());
    apiClient
      .post('/verify/send', {})
      .then(() => {
        // do nothing
      })
      .catch((error) => {
        const { response } = error;
        dispatch({
          type: ActionTypes.ERROR,
          message: response.data
        });
      });
  };
}

export function verifyEmailConfirmation(token) {
  return (dispatch) => {
    dispatch(emailVerificationVerify({ state: 'checking' }));
    return apiClient
      .get(`/verify?t=${token}`, {})
      .then((response) =>
        dispatch(emailVerificationVerified({ message: response.data }))
      )
      .catch((error) => {
        const { response } = error;
        dispatch(emailVerificationInvalid({ message: response.data }));
      });
  };
}

export function validateResetPasswordToken(token) {
  return (dispatch) => {
    apiClient
      .get(`/reset-password/${token}`)
      .then(() => {
        // do nothing if the token is valid
      })
      .catch(() => dispatch(invalidResetPasswordToken()));
  };
}

export function updatePassword(formValues, token) {
  return (dispatch) =>
    new Promise((resolve) =>
      apiClient
        .post(`/reset-password/${token}`, formValues)
        .then((response) => {
          dispatch(authUser(response.data));
          browserHistory.push('/');
          resolve();
        })
        .catch((error) => {
          dispatch(invalidResetPasswordToken());
          resolve({ error });
        })
    );
}

export function updateSettingsSuccess(user) {
  return {
    type: ActionTypes.SETTINGS_UPDATED,
    user
  };
}

export function submitSettings(formValues) {
  return apiClient.put('/account', formValues);
}

export function updateSettings(formValues) {
  return (dispatch) =>
    new Promise((resolve) =>
      submitSettings(formValues)
        .then((response) => {
          dispatch(updateSettingsSuccess(response.data));
          dispatch(showToast(5500));
          dispatch(setToastText('Toast.SettingsSaved'));
          resolve();
        })
        .catch((error) => resolve({ error }))
    );
}

export function createApiKeySuccess(user) {
  return {
    type: ActionTypes.API_KEY_CREATED,
    user
  };
}

export function createApiKey(label) {
  return (dispatch) =>
    apiClient
      .post('/account/api-keys', { label })
      .then((response) => {
        dispatch(createApiKeySuccess(response.data));
      })
      .catch((error) => {
        const { response } = error;
        Promise.reject(new Error(response.data.error));
      });
}

export function removeApiKey(keyId) {
  return (dispatch) =>
    apiClient
      .delete(`/account/api-keys/${keyId}`)
      .then((response) => {
        dispatch(apiKeyRemoved(response.data));
      })
      .catch((error) => {
        const { response } = error;
        Promise.reject(new Error(response.data.error));
      });
}

export function unlinkService(service) {
  return (dispatch) => {
    if (!['github', 'google'].includes(service)) return;
    apiClient
      .delete(`/auth/${service}`)
      .then((response) => {
        dispatch(authUser(response.data));
      })
      .catch((error) => {
        const { response } = error;
        const message = response.message || response.data.error;
        dispatch(authError(message));
      });
  };
}

export function setUserCookieConsent(cookieConsent) {
  // maybe also send this to the server rn?
  return (dispatch) => {
    apiClient
      .put('/cookie-consent', { cookieConsent })
      .then(() => {
        dispatch(setCookieConsent(cookieConsent));
      })
      .catch((error) => {
        const { response } = error;
        const message = response.message || response.data.error;
        dispatch(authError(message));
      });
  };
}
