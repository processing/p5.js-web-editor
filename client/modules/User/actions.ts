import type { AnyAction, Dispatch } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import * as ActionTypes from '../../constants';
import browserHistory from '../../browserHistory';
import { opApiClient } from '../../utils/opApiClient';
import { revokeStoredToken } from '../../utils/opAuth';
import { showToast, setToastText } from '../IDE/actions/toast';
import type { Error, PublicUser } from '../../../common/types';
import type { RootState } from '../../reducers';

// Authentication and account management are handled entirely by OpenProcessing.
// Sign in / sign up happen through the OAuth popup (see OpenProcessingButton),
// and the per-user access token in localStorage is the only authority. The
// legacy email/password, account-settings, password-reset, email-verification
// and personal-access-token flows (which talked to the old editor server) were
// removed along with that server.

function getRequestErrorMessage(error: any) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.message ||
    error?.message ||
    'Request failed.'
  );
}

/**
 * Records an authentication error in the store and surfaces it to the user.
 *
 * The reducer only clears the authenticated flag, so without a visible
 * notification an auth failure (e.g. a token lacking the required scope) would
 * otherwise only be observable in devtools. We show the message via a toast so
 * the user understands why they could not be signed in.
 */
export function authError(error: Error | string) {
  return (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    dispatch({
      type: ActionTypes.AUTH_ERROR,
      payload: error
    });
    const message =
      typeof error === 'string' ? error : getRequestErrorMessage(error);
    if (message) {
      dispatch(setToastText(message));
      dispatch(showToast(8000));
    }
  };
}

export function authenticateUser(user: PublicUser) {
  return {
    type: ActionTypes.AUTH_USER,
    user
  };
}

export function getUser() {
  return async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>) => {
    try {
      const { data } = await opApiClient.get('/whoami');

      dispatch(
        authenticateUser({
          id: String(data.userID),
          username: data.username ?? '',
          totalSketches: Number(data.totalSketches ?? 0)
        } as any)
      );
    } catch (error: any) {
      const message = getRequestErrorMessage(error);
      dispatch(authError(message));
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
  return async (dispatch: Dispatch) => {
    // Revoke the OP token (best-effort) and clear local storage.
    // No editor-side server logout — there is no editor session anymore.
    await revokeStoredToken();
    dispatch({
      type: ActionTypes.UNAUTH_USER
    });
    resetProject(dispatch);
  };
}
