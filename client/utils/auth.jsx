import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  useLocation,
  useParams,
  useSearchParams,
  Navigate
} from 'react-router-dom';

const redirectQueryParam = 'redirect';

const RouterRedirect = ({
  redirectPath,
  authenticatedSelector,
  allowRedirectBack = true,
  children = null
}) => {
  const canView = useSelector(authenticatedSelector);

  const location = useLocation();

  // Redirect off the page if not able to view.
  return canView ? (
    <>{children}</>
  ) : (
    <Navigate
      to={{
        pathname: redirectPath,
        search: allowRedirectBack
          ? `${redirectQueryParam}=${encodeURIComponent(location.pathname)}`
          : ''
      }}
      replace
    />
  );
};

RouterRedirect.propTypes = {
  children: PropTypes.element,
  // The url to redirect user to if they fail
  redirectPath: PropTypes.string.isRequired,
  // Determine if the user is authenticated or not
  authenticatedSelector: PropTypes.func.isRequired,
  // Optionally sets a redirect= query var in the URL
  allowRedirectBack: PropTypes.bool
};

RouterRedirect.defaultProps = {
  children: null,
  allowRedirectBack: true
};

const componentToHOC = (AuthComponent, wrapperDisplayName) => (Component) => {
  const Wrapper = (props) => (
    <AuthComponent>
      <Component {...props} />
    </AuthComponent>
  );
  Wrapper.displayName = wrapperDisplayName;
  return Wrapper;
};

export const UserIsAuthenticated = ({ children }) => (
  <RouterRedirect
    redirectPath="/login"
    authenticatedSelector={(state) => state.user.authenticated === true}
    allowRedirectBack
  >
    {children}
  </RouterRedirect>
);

UserIsAuthenticated.propTypes = {
  children: PropTypes.element.isRequired
};

export const userIsAuthenticated = componentToHOC(
  UserIsAuthenticated,
  'UserIsAuthenticated'
);

export const UserIsNotAuthenticated = ({ children }) => {
  const [search] = useSearchParams();

  return (
    <RouterRedirect
      redirectPath={search.get(redirectQueryParam) || '/'}
      authenticatedSelector={(state) => state.user.authenticated === false}
      allowRedirectBack={false}
    >
      {children}
    </RouterRedirect>
  );
};

export const userIsNotAuthenticated = componentToHOC(
  UserIsNotAuthenticated,
  'UserIsNotAuthenticated'
);

UserIsNotAuthenticated.propTypes = {
  children: PropTypes.element.isRequired
};

/**
 * Ensures that the currently logged-in user matches the username in the URL.
 */
export const UserIsAuthorized = ({ children }) => {
  const params = useParams();
  return (
    <RouterRedirect
      redirectPath="/"
      authenticatedSelector={(state) => state.user.username === params.username}
      allowRedirectBack={false}
    >
      {children}
    </RouterRedirect>
  );
};

UserIsAuthorized.propTypes = {
  children: PropTypes.element.isRequired
};

export const userIsAuthorized = componentToHOC(
  UserIsAuthorized,
  'UserIsAuthorized'
);
