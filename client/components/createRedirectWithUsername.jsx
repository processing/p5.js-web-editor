import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';

const RedirectToUser = ({ url = '/:username/sketches' }) => {
  const history = useHistory();
  const username = useSelector((state) =>
    state.user ? state.user.username : null
  );
  useEffect(() => {
    if (username) {
      history.replace(url.replace(':username', username));
    }
  }, [history, url, username]);

  return null;
};

RedirectToUser.propTypes = {
  url: PropTypes.string.isRequired
};

export default RedirectToUser;
