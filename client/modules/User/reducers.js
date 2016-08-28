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
    default:
      return state;
  }
};

export default user;
