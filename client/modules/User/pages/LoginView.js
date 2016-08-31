import React from 'react';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import * as UserActions from '../actions';
import LoginForm from '../components/LoginForm';
import InlineSVG from 'react-inlinesvg';
const githubUrl = require('../../../images/github.svg');


function LoginView(props) {
  return (
    <div className="login">
      <h1>Login</h1>
      <LoginForm {...props} />
      <h2 className="login__divider">Or</h2>
      <a
        className="login__github-button"
        href="/auth/github"
      >
        <InlineSVG src={githubUrl} className="login__github-icon" />
        <span>Login with Github</span>
      </a>
    </div>
  );
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
    errors.email = 'Please enter a email';
  }
  if (!formProps.password) {
    errors.password = 'Please enter a password';
  }
  return errors;
}

export default reduxForm({
  form: 'login',
  fields: ['email', 'password'],
  validate
}, mapStateToProps, mapDispatchToProps)(LoginView);
