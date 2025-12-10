import { FORM_ERROR } from 'final-form';
import type { AnyAction, Dispatch } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import * as ActionTypes from '../../constants';
import browserHistory from '../../browserHistory';
import { apiClient } from '../../utils/apiClient';
import { showErrorModal, justOpenedProject } from '../IDE/actions/ide';
import { setLanguage } from '../IDE/actions/preferences';
import { showToast, setToastText } from '../IDE/actions/toast';
import type {
  CreateApiKeyRequestBody,
  CreateUserRequestBody,
  Error,
  PublicUser,
  PublicUserOrError,
  PublicUserOrErrorOrGeneric,
  RemoveApiKeyRequestParams,
  ResetOrUpdatePasswordRequestParams,
  ResetPasswordInitiateRequestBody,
  UpdateCookieConsentRequestBody,
  UpdatePasswordRequestBody,
  UpdateSettingsRequestBody,
  UserPreferences,
  VerifyEmailQuery
} from '../../../common/types';
import type { GetRootState, RootState } from '../../reducers';

export function authError(error: Error) {
  return {
    type: ActionTypes.AUTH_ERROR,
    payload: error
  };
}

/**
 * - Method: `POST`
 * - Endpoint: `/signup`
 * - Authenticated: `false`
 * - Id: `UserController.createUser`
 *
 * Description:
 *   - Create a new user
 */
export function signUpUser(formValues: CreateUserRequestBody) {
  return apiClient.post('/signup', formValues);
}

export function loginUser(formValues: { email: string; password: string }) {
  return apiClient.post('/login', formValues);
}

export function authenticateUser(user: PublicUser) {
  return {
    type: ActionTypes.AUTH_USER,
    user
  };
}

export function loginUserFailure(error: Error) {
  return {
    type: ActionTypes.AUTH_ERROR,
    error
  };
}

export function setPreferences(preferences: UserPreferences) {
  return {
    type: ActionTypes.SET_PREFERENCES,
    preferences
  };
}

export function validateAndLoginUser(formProps: {
  email: string;
  password: string;
}) {
  return (
    dispatch: ThunkDispatch<RootState, unknown, AnyAction>,
    getState: GetRootState
  ) => {
    const state = getState();
    const { previousPath } = state.ide;
    return new Promise<void | PublicUserOrError | { [FORM_ERROR]: string }>(
      (resolve) => {
        loginUser(formProps)
          .then((response) => {
            dispatch(authenticateUser(response.data));
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
      }
    );
  };
}

/**
 * - Method: `POST`
 * - Endpoint: `/signup`
 * - Authenticated: `false`
 * - Id: `UserController.createUser`
 *
 * Description:
 *   - Create a new user
 */
export function validateAndSignUpUser(formValues: CreateUserRequestBody) {
  return (dispatch: Dispatch, getState: GetRootState) => {
    const state = getState();
    const { previousPath } = state.ide;
    return new Promise<void | PublicUserOrError>((resolve) => {
      signUpUser(formValues)
        .then((response) => {
          dispatch(authenticateUser(response.data));
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
  return async (dispatch: Dispatch) => {
    try {
      const response = await apiClient.get('/session');
      const { data } = response;

      if (data?.user === null) {
        return;
      }

      dispatch(authenticateUser(data));
      dispatch({
        type: ActionTypes.SET_PREFERENCES,
        preferences: data.preferences
      });
      setLanguage(data.preferences.language, { persistPreference: false });
    } catch (error: any) {
      const message = error.response
        ? error.response.data.error || error.response.message
        : 'Unknown error.';
      dispatch(authError(message));
    }
  };
}

export function validateSession() {
  return async (dispatch: Dispatch, getState: GetRootState) => {
    try {
      const response = await apiClient.get('/session');
      const state = getState();

      if (state.user.username !== response.data.username) {
        dispatch(showErrorModal('staleSession'));
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        dispatch(showErrorModal('staleSession'));
      }
    }
  };
}

export function resetProject(dispatch: Dispatch) {
  dispatch({
    type: ActionTypes.RESET_PROJECT
  });
  dispatch({
    type: ActionTypes.CLEAR_CONSOLE
  });
  browserHistory.push('/');
}

export function logoutUser() {
  return (dispatch: Dispatch) => {
    apiClient
      .get('/logout')
      .then(() => {
        dispatch({
          type: ActionTypes.UNAUTH_USER
        });
        resetProject(dispatch);
      })
      .catch((error) => {
        const { response } = error;
        dispatch(authError(response.data.error));
      });
  };
}

/**
 * - Method: `POST`
 * - Endpoint: `/reset-password`
 * - Authenticated: `false`
 * - Id: `UserController.resetPasswordInitiate`
 *
 * Description:
 *   - Send an Reset-Password email to the registered email account
 */
export function initiateResetPassword(
  formValues: ResetPasswordInitiateRequestBody
) {
  return (dispatch: Dispatch) =>
    new Promise<void | PublicUserOrErrorOrGeneric>((resolve) => {
      dispatch({
        type: ActionTypes.RESET_PASSWORD_INITIATE
      });
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

/**
 * - Method: `POST`
 * - Endpoint: `/verify/send`
 * - Authenticated: `false`
 * - Id: `UserController.emailVerificationInitiate`
 *
 * Description:
 *   - Send a Confirm Email email to verify that the user owns the specified email account
 */
export function initiateVerification() {
  return (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.EMAIL_VERIFICATION_INITIATE
    });
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

/**
 * - Method: `GET`
 * - Endpoint: `/verify`
 * - Authenticated: `false`
 * - Id: `UserController.verifyEmail`
 *
 * Description:
 *   - Used in the Confirm Email's link to verify a user's email is attached to their account
 */
export function verifyEmailConfirmation(token: VerifyEmailQuery['t']) {
  return (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.EMAIL_VERIFICATION_VERIFY,
      state: 'checking'
    });
    return apiClient
      .get(`/verify?t=${token}`, {})
      .then((response) =>
        dispatch({
          type: ActionTypes.EMAIL_VERIFICATION_VERIFIED,
          message: response.data
        })
      )
      .catch((error) => {
        const { response } = error;
        dispatch({
          type: ActionTypes.EMAIL_VERIFICATION_INVALID,
          message: response.data
        });
      });
  };
}

export function resetPasswordReset() {
  return {
    type: ActionTypes.RESET_PASSWORD_RESET
  };
}

/**
 * - Method: `GET`
 * - Endpoint: `/reset-password/:token`
 * - Authenticated: `false`
 * - Id: `UserController.validateResetPasswordToken`
 *
 * Description:
 *   - The link in the Reset Password email, which contains a reset token that is valid for 1h
 *   - If valid, the user will see a form to reset their password
 *   - Else they will see a message that their token has expired
 */
export function validateResetPasswordToken(
  token: ResetOrUpdatePasswordRequestParams['token']
) {
  return (dispatch: Dispatch) => {
    apiClient
      .get(`/reset-password/${token}`)
      .then(() => {
        // do nothing if the token is valid
      })
      .catch(() =>
        dispatch({
          type: ActionTypes.INVALID_RESET_PASSWORD_TOKEN
        })
      );
  };
}

/**
 * - Method: `POST`
 * - Endpoint: `/reset-password/:token`
 * - Authenticated: `false`
 * - Id: `UserController.updatePassword`
 *
 * Description:
 *   - Used by the new password form to update a user's password with the valid token
 *   - Returns a Generic 401 - 'Password reset token is invalid or has expired.' if the token timed out
 *   - Returns a PublicUser if successfully saved
 *   - Returns an Error if network error on save attempt
 */
export function updatePassword(
  formValues: UpdatePasswordRequestBody,
  token: ResetOrUpdatePasswordRequestParams['token']
) {
  return (dispatch: Dispatch) =>
    new Promise<void | PublicUserOrErrorOrGeneric>((resolve) =>
      apiClient
        .post(`/reset-password/${token}`, formValues)
        .then((response) => {
          dispatch(authenticateUser(response.data));
          browserHistory.push('/');
          resolve();
        })
        .catch((error) => {
          dispatch({
            type: ActionTypes.INVALID_RESET_PASSWORD_TOKEN
          });
          resolve({ error });
        })
    );
}

export function updateSettingsSuccess(user: PublicUser) {
  return {
    type: ActionTypes.SETTINGS_UPDATED,
    user
  };
}

/**
 * - Method: `PUT`
 * - Endpoint: `/account`
 * - Authenticated: `true`
 * - Id: `UserController.updateSettings`
 *
 * Description:
 *   - Used to update the user's username, email, or password on the `/account` page while authenticated
 *   - Currently the client only shows the `currentPassword` and `newPassword` fields if no social logins (github & google) are enabled
 */
export function submitSettings(formValues: UpdateSettingsRequestBody) {
  return apiClient.put('/account', formValues);
}
/**
 * - Method: `PUT`
 * - Endpoint: `/account`
 * - Authenticated: `true`
 * - Id: `UserController.updateSettings`
 *
 * Description:
 *   - Used to update the user's username, email, or password on the `/account` page while authenticated
 *   - Currently the client only shows the `currentPassword` and `newPassword` fields if no social logins (github & google) are enabled
 */
export function updateSettings(formValues: Partial<UpdateSettingsRequestBody>) {
  return (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) =>
    new Promise<void | PublicUserOrError>((resolve) => {
      if (!formValues.currentPassword && formValues.newPassword) {
        dispatch(showToast(5500));
        dispatch(setToastText('Toast.EmptyCurrentPass'));
        resolve();
        return;
      }
      submitSettings(formValues as UpdateSettingsRequestBody)
        .then((response) => {
          dispatch(updateSettingsSuccess(response.data));
          dispatch(showToast(5500));
          dispatch(setToastText('Toast.SettingsSaved'));
          resolve();
        })
        .catch((error) => {
          if (error.response) {
            switch (error.response.status) {
              case 401:
                dispatch(showToast(5500));
                dispatch(setToastText('Toast.IncorrectCurrentPass'));
                break;
              case 404:
                dispatch(showToast(5500));
                dispatch(setToastText('Toast.UserNotFound'));
                break;
              default:
                dispatch(showToast(5500));
                dispatch(setToastText('Toast.DefaultError'));
            }
          } else {
            dispatch(showToast(5500));
            dispatch(setToastText('Toast.NetworkError'));
          }
        });
    });
}

export function createApiKeySuccess(user: PublicUser) {
  return {
    type: ActionTypes.API_KEY_CREATED,
    user
  };
}

export function createApiKey(label: CreateApiKeyRequestBody['label']) {
  return (dispatch: Dispatch) =>
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

export function removeApiKey(keyId: RemoveApiKeyRequestParams['keyId']) {
  return (dispatch: Dispatch) =>
    apiClient
      .delete(`/account/api-keys/${keyId}`)
      .then((response) => {
        dispatch({
          type: ActionTypes.API_KEY_REMOVED,
          user: response.data
        });
      })
      .catch((error) => {
        const { response } = error;
        Promise.reject(new Error(response.data.error));
      });
}

export function unlinkService(service: string) {
  return (dispatch: Dispatch) => {
    if (!['github', 'google'].includes(service)) return;
    apiClient
      .delete(`/auth/${service}`)
      .then((response) => {
        dispatch(authenticateUser(response.data));
      })
      .catch((error) => {
        const { response } = error;
        const message = response.message || response.data.error;
        dispatch(authError(message));
      });
  };
}

export function setUserCookieConsent(
  cookieConsent: UpdateCookieConsentRequestBody['cookieConsent']
) {
  // maybe also send this to the server rn?
  return (dispatch: Dispatch) => {
    apiClient
      .put('/cookie-consent', { cookieConsent })
      .then(() => {
        dispatch({
          type: ActionTypes.SET_COOKIE_CONSENT,
          cookieConsent
        });
      })
      .catch((error) => {
        const { response } = error;
        const message = response.message || response.data.error;
        dispatch(authError(message));
      });
  };
}
