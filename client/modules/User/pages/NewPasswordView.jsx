import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { Helmet } from 'react-helmet';
import NewPasswordForm from '../components/NewPasswordForm';
import * as UserActions from '../actions';
import Nav from '../../../components/Nav';

function NewPasswordView(props) {
  const newPasswordClass = classNames({
    'new-password': true,
    'new-password--invalid': props.user.resetPasswordInvalid,
    'form-container': true,
    'user': true
  });
  return (
    <div className="new-password-container">
      <Nav layout="dashboard" />
      <div className={newPasswordClass}>
        <Helmet>
          <title>p5.js Web Editor | New Password</title>
        </Helmet>
        <div className="form-container__content">
          <h2 className="form-container__title">Set a New Password</h2>
          <NewPasswordForm {...props} />
          <p className="new-password__invalid">
            The password reset token is invalid or has expired.
          </p>
        </div>
      </div>
    </div>
  );
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
