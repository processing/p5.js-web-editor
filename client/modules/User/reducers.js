import * as ActionTypes from '../../constants';

const user = (state = { authenticated: false }, action) => {
  switch (action.type) {
    case ActionTypes.AUTH_USER:
      return { ...action.user,
        authenticated: true };
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
    case ActionTypes.SETTINGS_UPDATED:
      return { ...state, ...action.user };
    default:
      return state;
  }
};

export default user;
