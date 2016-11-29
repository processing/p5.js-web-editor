import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
const exitUrl = require('../../../images/exit.svg');
import { Link } from 'react-router';

class ForceAuthentication extends React.Component {
  componentDidMount() {
    this.refs.forceAuthentication.focus();
  }

  render() {
    return (
      <section className="force-authentication" ref="forceAuthentication" tabIndex="0">
        <header className="force-authentication__header">
          <button className="force-authentication__exit-button" onClick={this.props.closeModal}>
            <InlineSVG src={exitUrl} alt="Close About Overlay" />
          </button>
        </header>
        <div className="force-authentication__copy">
          <p>
            In order to save sketches, you must be logged in. Please&nbsp;
            <Link to="/login" onClick={this.props.closeModal}>Login</Link>
            &nbsp;or&nbsp;
            <Link to="/signup" onClick={this.props.closeModal}>Sign Up</Link>.
          </p>
        </div>
      </section>
    );
  }
}

ForceAuthentication.propTypes = {
  closeModal: PropTypes.func.isRequired
};

export default ForceAuthentication;
