import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import browserHistory from '../browserHistory';

const RedirectToUser = ({ url = '/:username/sketches' }) => {
  const username = useSelector((state) =>
    state.user ? state.user.username : null
  );
  useEffect(() => {
    if (username == null) {
      return;
    }
    browserHistory.replace(url.replace(':username', username));
  }, [username, url]);
  return null;
};

RedirectToUser.propTypes = {
  url: PropTypes.string.isRequired
};

export default RedirectToUser;
