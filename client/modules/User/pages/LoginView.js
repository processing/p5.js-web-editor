import React from 'react';
import { reduxForm } from 'redux-form';
import { validateAndLoginUser } from '../actions';
import LoginForm from '../components/LoginForm';
// import GithubButton from '../components/GithubButton';
import { Link } from 'react-router';


function LoginView(props) {
  return (
    <div className="login">
      <h1>Login</h1>
      <LoginForm {...props} />
      {/* <h2 className="login__divider">Or</h2>
      <GithubButton buttonText="Login with Github" /> */}
      <Link className="form__cancel-button" to="/">Cancel</Link>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

function mapDispatchToProps() {
  return {
    validateAndLoginUser
  };
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
