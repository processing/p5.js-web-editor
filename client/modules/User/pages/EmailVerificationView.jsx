import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import InlineSVG from 'react-inlinesvg';
import get from 'lodash/get';
import { verifyEmailConfirmation } from '../actions';

const exitUrl = require('../../../images/exit.svg');
const logoUrl = require('../../../images/p5js-logo.svg');


class EmailVerificationView extends React.Component {
  static defaultProps = {
    emailVerificationTokenState: null,
  }

  constructor(props) {
    super(props);
    this.closeLoginPage = this.closeLoginPage.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);

    this.state = {
      error: null,
    };
  }

  componentWillMount() {
    const verificationToken = this.verificationToken();
    if (verificationToken != null) {
      this.props.verifyEmailConfirmation(verificationToken);
    }
  }

  verificationToken = () => get(this.props, 'location.query.t', null);

  closeLoginPage() {
    browserHistory.push(this.props.previousPath);
  }

  gotoHomePage() {
    browserHistory.push('/');
  }

  render() {
    let status = null;
    const {
      emailVerificationTokenState,
    } = this.props;

    if (this.verificationToken() == null) {
      status = (
        <p>That link is invalid</p>
      );
    } else if (emailVerificationTokenState === 'checking') {
      status = (
        <p>Validating token, please wait...</p>
      );
    } else if (emailVerificationTokenState === 'verified') {
      status = (
        <p>All done, your email address has been verified.</p>
      );
    } else if (emailVerificationTokenState === 'invalid') {
      status = (
        <p>Something went wrong.</p>
      );
    }

    return (
      <div className="form-container">
        <div className="form-container__header">
          <button className="form-container__logo-button" onClick={this.gotoHomePage}>
            <InlineSVG src={logoUrl} alt="p5js Logo" />
          </button>
          <button className="form-container__exit-button" onClick={this.closeLoginPage}>
            <InlineSVG src={exitUrl} alt="Close Login Page" />
          </button>
        </div>
        <div className="form-container__content">
          <h2 className="form-container__title">Verify your email</h2>
          {status}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    emailVerificationTokenState: state.user.emailVerificationTokenState,
    previousPath: state.ide.previousPath
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    verifyEmailConfirmation,
  }, dispatch);
}


EmailVerificationView.propTypes = {
  previousPath: PropTypes.string.isRequired,
  emailVerificationTokenState: PropTypes.oneOf([
    'checking', 'verified', 'invalid'
  ]),
  verifyEmailConfirmation: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailVerificationView);
