import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import classNames from 'classnames';
import { browserHistory } from 'react-router';
import InlineSVG from 'react-inlinesvg';
import { bindActionCreators } from 'redux';
import { Helmet } from 'react-helmet';
import NewPasswordForm from '../components/NewPasswordForm';
import * as UserActions from '../actions';

const exitUrl = require('../../../images/exit.svg');
const logoUrl = require('../../../images/p5js-logo.svg');

class NewPasswordView extends React.Component {
  constructor(props) {
    super(props);
    this.gotoHomePage = this.gotoHomePage.bind(this);
  }

  componentDidMount() {
    // need to check if this is a valid token
    this.props.validateResetPasswordToken(this.props.params.reset_password_token);
  }

  gotoHomePage() {
    browserHistory.push('/');
  }

  render() {
    const newPasswordClass = classNames({
      'new-password': true,
      'new-password--invalid': this.props.user.resetPasswordInvalid,
      'form-container': true
    });
    return (
      <div className={newPasswordClass}>
        <Helmet>
          <title>p5.js Web Editor | New Password</title>
        </Helmet>
        <div className="form-container__header">
          <button className="form-container__logo-button" onClick={this.gotoHomePage}>
            <InlineSVG src={logoUrl} alt="p5js Logo" />
          </button>
          <button className="form-container__exit-button" onClick={this.gotoHomePage}>
            <InlineSVG src={exitUrl} alt="Close NewPassword Page" />
          </button>
        </div>
        <div className="form-container__content">
          <h2 className="form-container__title">Set a New Password</h2>
          <NewPasswordForm {...this.props} />
          <p className="new-password__invalid">
            The password reset token is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }
}

NewPasswordView.propTypes = {
  params: PropTypes.shape({
    reset_password_token: PropTypes.string,
  }).isRequired,
  validateResetPasswordToken: PropTypes.func.isRequired,
  user: PropTypes.shape({
    resetPasswordInvalid: PropTypes.bool
  }).isRequired
};

function validate(formProps) {
  const errors = {};

  if (!formProps.password) {
    errors.password = 'Please enter a password';
  }
  if (!formProps.confirmPassword) {
    errors.confirmPassword = 'Please enter a password confirmation';
  }

  if (formProps.password !== formProps.confirmPassword) {
    errors.password = 'Passwords must match';
  }

  return errors;
}

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(UserActions, dispatch);
}

export default reduxForm({
  form: 'new-password',
  fields: ['password', 'confirmPassword'],
  validate
}, mapStateToProps, mapDispatchToProps)(NewPasswordView);
