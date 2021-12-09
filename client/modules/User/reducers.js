import * as ActionTypes from '../../constants';

const user = (state = { authenticated: false }, action) => {
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
    case ActionTypes.RESET_PASSWORD_INITIATE:
      return Object.assign({}, state, { resetPasswordInitiate: true });
    case ActionTypes.RESET_PASSWORD_RESET:
      return Object.assign({}, state, { resetPasswordInitiate: false });
    case ActionTypes.INVALID_RESET_PASSWORD_TOKEN:
      return Object.assign({}, state, { resetPasswordInvalid: true });
    case ActionTypes.EMAIL_VERIFICATION_INITIATE:
      return Object.assign({}, state, { emailVerificationInitiate: true });
    case ActionTypes.EMAIL_VERIFICATION_VERIFY:
      return Object.assign({}, state, {
        emailVerificationTokenState: 'checking'
      });
    case ActionTypes.EMAIL_VERIFICATION_VERIFIED:
      return Object.assign({}, state, {
        emailVerificationTokenState: 'verified'
      });
    case ActionTypes.EMAIL_VERIFICATION_INVALID:
      return Object.assign({}, state, {
        emailVerificationTokenState: 'invalid'
      });
    case ActionTypes.SETTINGS_UPDATED:
      return { ...state, ...action.user };
    case ActionTypes.API_KEY_REMOVED:
      return { ...state, ...action.user };
    case ActionTypes.API_KEY_CREATED:
      return { ...state, ...action.user };
    case ActionTypes.SET_COOKIE_CONSENT:
      return { ...state, cookieConsent: action.cookieConsent };
    default:
      return state;
  }
};

export default user;
