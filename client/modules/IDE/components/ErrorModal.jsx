import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';

class ErrorModal extends React.Component {
  forceAuthentication() {
    return (
      <p>
        In order to save sketches, you must be logged in. Please&nbsp;
        <Link to="/login" onClick={this.props.closeModal}>Login</Link>
        &nbsp;or&nbsp;
        <Link to="/signup" onClick={this.props.closeModal}>Sign Up</Link>.
      </p>
    );
  }

  unauthorizedProject() {
    return (
      <p>
        You have no access to save the project.
      </p>
    );
  }

  staleSession() {
    return (
      <p>
        It looks like you&apos;ve been logged out. Please&nbsp;
        <Link to="/login" onClick={this.props.closeModal}>log in</Link>.
      </p>
    );
  }

  staleProject() {
    return (
      <p>
        The project you have attempted to save is out of date. Please refresh the page.
      </p>
    );
  }

  render() {
    return (
      <div className="error-modal__content">
        {(() => { // eslint-disable-line
          if (this.props.type === 'forceAuthentication') {
            return this.forceAuthentication();
          } else if (this.props.type === 'staleSession') {
            return this.staleSession();
          } else if (this.props.type === 'staleProject') {
            return this.staleProject();
          } else if (this.props.type === 'unauthorizedProject') {
            return this.unauthorizedProject();
          }
        })()}
      </div>
    );
  }
}

ErrorModal.propTypes = {
  type: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default ErrorModal;
