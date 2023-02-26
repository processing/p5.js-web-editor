import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * Sets the current username to the `:username` template in the provided URL,
 * eg. `/:username/sketches` => `/p5/sketches`.
 */
const RedirectToUser = ({ url = '/:username/sketches' }) => {
  const username = useSelector((state) =>
    state.user ? state.user.username : null
  );
  return username ? (
    <Navigate to={url.replace(':username', username)} replace />
  ) : null;
};

RedirectToUser.propTypes = {
  url: PropTypes.string.isRequired
};

export default RedirectToUser;
