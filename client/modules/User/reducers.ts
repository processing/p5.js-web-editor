import type { PublicUser } from '../../../common/types';
import * as ActionTypes from '../../constants';

// User Action:
export type UserAction = {
  user?: PublicUser;
  type: any;
};

// Authentication is handled by OpenProcessing; the editor only tracks whether
// the user is signed in and their public profile. Password-reset, email
// verification, account settings, API keys and cookie-consent were removed
// along with the editor's own user server, so their reducer cases are gone.
export const user = (
  state: Partial<PublicUser> & {
    authenticated: boolean;
  } = {
    authenticated: false
  },
  action: UserAction
) => {
  switch (action.type) {
    case ActionTypes.AUTH_USER:
      return {
        ...action.user,
        authenticated: true
      };
    case ActionTypes.UNAUTH_USER:
      return {
        authenticated: false
      };
    case ActionTypes.AUTH_ERROR:
      return {
        authenticated: false
      };
    default:
      return state;
  }
};
