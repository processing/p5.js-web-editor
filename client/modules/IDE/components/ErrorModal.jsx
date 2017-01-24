import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
const exitUrl = require('../../../images/exit.svg');
import { Link } from 'react-router';

class ErrorModal extends React.Component {
  componentDidMount() {
    this.refs.modal.focus();
  }


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

  staleSession() {
    return (
      <p>
        It looks like you've been logged out. Please&nbsp;
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
      <section className="error-modal" ref="modal" tabIndex="0">
        <header className="error-modal__header">
          <h2 className="error-modal__title">Error</h2>
          <button className="error-modal__exit-button" onClick={this.props.closeModal}>
            <InlineSVG src={exitUrl} alt="Close Error Modal" />
          </button>
        </header>
        <div className="error-modal__content">
          {(() => { // eslint-disable-line
            if (this.props.type === 'forceAuthentication') {
              return this.forceAuthentication();
            } else if (this.props.type === 'staleSession') {
              return this.staleSession();
            } else if (this.props.type === 'staleProject') {
              return this.staleProject();
            }
          })()}
        </div>
      </section>
    );
  }
}

ErrorModal.propTypes = {
  type: PropTypes.string,
  closeModal: PropTypes.func.isRequired
};

export default ErrorModal;
