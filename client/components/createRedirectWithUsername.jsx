import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

const RedirectToUser = ({ username, url = '/:username/sketches' }) => {
  React.useEffect(() => {
    if (username == null) {
      return;
    }

    browserHistory.replace(url.replace(':username', username));
  }, [username]);

  return null;
};

RedirectToUser.propTypes = {
  url: PropTypes.string.isRequired,
  username: PropTypes.string
};

RedirectToUser.defaultProps = {
  username: null
};

function mapStateToProps(state) {
  return {
    username: state.user ? state.user.username : null
  };
}

const ConnectedRedirectToUser = connect(mapStateToProps)(RedirectToUser);

const createRedirectWithUsername = (url) => (props) => (
  <ConnectedRedirectToUser {...props} url={url} />
);

export default createRedirectWithUsername;
