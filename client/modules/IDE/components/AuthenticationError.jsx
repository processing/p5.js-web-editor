import React, { PropTypes } from 'react';
import { Link } from 'react-router';

function AuthenticationError(props) {
  return (
    <section className="authentication-error" tabIndex="0">
      <header className="authentication-error__header">
        <h2 className="authentication-error__title">Error</h2>
      </header>
      <div className="authentication-error__copy">
        <p>
          It looks like you've been logged out. Please&nbsp;
          <Link to="/login" onClick={props.closeModal}>log in</Link>.
        </p>
      </div>
    </section>
  );
}

AuthenticationError.propTypes = {
  closeModal: PropTypes.func.isRequired
};

export default AuthenticationError;
