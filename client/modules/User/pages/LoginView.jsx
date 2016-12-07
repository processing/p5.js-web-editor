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
      <p className="form__navigation-options">
        Don't have an account?&nbsp;
        <Link className="form__signup-button" to="/signup">Sign Up</Link>
      </p>
      <p className="form__navigation-options">
        Forgot your password?&nbsp;
        <Link className="form__reset-password-button" to="/reset-password">Reset your password</Link>
      </p>
      <Link className="form__cancel-button" to="/">Cancel</Link>
    </div>
  );
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
    previousPath: ownProps.previousPath
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
    errors.email = 'Please enter an email';
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
