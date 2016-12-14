import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { validateAndLoginUser } from '../actions';
import LoginForm from '../components/LoginForm';
// import GithubButton from '../components/GithubButton';
import { Link, browserHistory } from 'react-router';
import InlineSVG from 'react-inlinesvg';
const exitUrl = require('../../../images/exit.svg');
const logoUrl = require('../../../images/p5js-logo.svg');


class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.closeLoginPage = this.closeLoginPage.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);
  }

  closeLoginPage() {
    browserHistory.push(this.props.previousPath);
  }

  gotoHomePage() {
    browserHistory.push('/');
  }

  render() {
    return (
      <div className="login">
        <div className="login__header">
          <button className="login__logo-button" onClick={this.gotoHomePage}>
            <InlineSVG src={logoUrl} alt="p5js Logo" />
          </button>
          <button className="login__exit-button" onClick={this.closeLoginPage}>
            <InlineSVG src={exitUrl} alt="Close Login Page" />
          </button>
        </div>
        <div className="login__content">
          <h2 className="login__title">Log In</h2>
          <LoginForm {...this.props} />
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
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    previousPath: state.ide.previousPath
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

LoginView.propTypes = {
  previousPath: PropTypes.string.isRequired
};

export default reduxForm({
  form: 'login',
  fields: ['email', 'password'],
  validate
}, mapStateToProps, mapDispatchToProps)(LoginView);
