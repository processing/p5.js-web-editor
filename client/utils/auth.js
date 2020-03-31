import { connectedRouterRedirect } from 'redux-auth-wrapper/history3/redirect';
import locationHelperBuilder from 'redux-auth-wrapper/history3/locationHelper';

const locationHelper = locationHelperBuilder({});

export const userIsAuthenticated = connectedRouterRedirect({
  // The url to redirect user to if they fail
  redirectPath: '/login',
  // Determine if the user is authenticated or not
  authenticatedSelector: state => state.user.authenticated === true,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsAuthenticated'
});

export const userIsNotAuthenticated = connectedRouterRedirect({
  redirectPath: (state, ownProps) => locationHelper.getRedirectQueryParam(ownProps) || '/',
  allowRedirectBack: false,
  authenticatedSelector: state => state.user.authenticated === false,
  wrapperDisplayName: 'UserIsNotAuthenticated'
});

export const userIsAuthorized = connectedRouterRedirect({
  redirectPath: '/',
  allowRedirectBack: false,
  authenticatedSelector: (state, ownProps) => {
    const { username } = ownProps.params;
    return state.user.username === username;
  },
});
