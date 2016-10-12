import React from 'react';
import { Link } from 'react-router';
import * as UserActions from '../../User/actions';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import ResetPasswordForm from './ResetPasswordForm';

class ResetPasswordView extends React.Component {
  componentDidMount() {
    this.refs.resetPassword.focus();
  }

  render() {
    return (
      <div className="reset-password" ref="resetPassword" tabIndex="0">
        <h1>Reset Your Password</h1>
        <ResetPasswordForm {...this.props} />
        <Link className="form__login-button" to="/login">Login</Link>
        or
        <Link className="form__signup-button" to="/signup">Sign up</Link>
        <Link className="form__cancel-button" to="/">Cancel</Link>
      </div>
    );
  }
}

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
    errors.email = 'Please enter an email'
  }
  return errors;
}

export default reduxForm({
  form: 'reset-password',
  fields: 'email',
  validate
}, mapStateToProps, mapDispatchToProps)(ResetPasswordView);
