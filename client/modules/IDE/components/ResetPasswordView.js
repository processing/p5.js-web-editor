import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import * as UserActions from '../../User/actions';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import ResetPasswordForm from './ResetPasswordForm';
import classNames from 'classnames';

class ResetPasswordView extends React.Component {
  componentWillMount() {
    this.props.resetPasswordReset();
  }

  componentDidMount() {
    this.refs.resetPassword.focus();
  }

  render() {
    console.log(this.props.user);
    const resetPasswordClass = classNames({
      'reset-password': true,
      'reset-password--submitted': this.props.user.resetPasswordInitiate
    });
    console.log(resetPasswordClass);
    return (
      <div className={resetPasswordClass} ref="resetPassword" tabIndex="0">
        <h1>Reset Your Password</h1>
        <ResetPasswordForm {...this.props} />
        <p className="reset-password__submitted">
          Your password reset email should arrive shortly. If you don't see it, check
          in your spam folder as sometimes it can end up there.
        </p>
        <p className="form__navigation-options">
          <Link className="form__login-button" to="/login">Login</Link>
          &nbsp;or&nbsp;
          <Link className="form__signup-button" to="/signup">Sign up</Link>
        </p>
        <Link className="form__cancel-button" to="/">Cancel</Link>
      </div>
    );
  }
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

function validate(formProps) {
  const errors = {};
  if (!formProps.email) {
    errors.email = 'Please enter an email';
  }
  return errors;
}

export default reduxForm({
  form: 'reset-password',
  fields: ['email'],
  validate
}, mapStateToProps, mapDispatchToProps)(ResetPasswordView);
