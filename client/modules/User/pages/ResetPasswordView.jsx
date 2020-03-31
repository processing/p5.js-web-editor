
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import { Helmet } from 'react-helmet';
import * as UserActions from '../actions';
import ResetPasswordForm from '../components/ResetPasswordForm';
import { validateResetPassword } from '../../../utils/reduxFormUtils';
import Nav from '../../../components/Nav';

function ResetPasswordView(props) {
  const resetPasswordClass = classNames({
    'reset-password': true,
    'reset-password--submitted': props.user.resetPasswordInitiate,
    'form-container': true,
    'user': true
  });
  return (
    <div className="reset-password-container">
      <Nav layout="dashboard" />
      <div className={resetPasswordClass}>
        <Helmet>
          <title>p5.js Web Editor | Reset Password</title>
        </Helmet>
        <div className="form-container__content">
          <h2 className="form-container__title">Reset Your Password</h2>
          <ResetPasswordForm {...props} />
          <p className="reset-password__submitted">
            Your password reset email should arrive shortly. If you don&apos;t see it, check
            in your spam folder as sometimes it can end up there.
          </p>
          <p className="form__navigation-options">
            <Link className="form__login-button" to="/login">Log In</Link>
            &nbsp;or&nbsp;
            <Link className="form__signup-button" to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

ResetPasswordView.propTypes = {
  resetPasswordReset: PropTypes.func.isRequired,
  user: PropTypes.shape({
    resetPasswordInitiate: PropTypes.bool
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(UserActions, dispatch);
}

export default reduxForm({
  form: 'reset-password',
  fields: ['email'],
  validate: validateResetPassword
}, mapStateToProps, mapDispatchToProps)(ResetPasswordView);
