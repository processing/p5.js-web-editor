import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import { Link, browserHistory } from 'react-router';
import InlineSVG from 'react-inlinesvg';
import { validateAndLoginUser } from '../actions';
import LoginForm from '../components/LoginForm';
import { validateLogin } from '../../../utils/reduxFormUtils';
import GithubButton from '../components/GithubButton';

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
    if (this.props.user.authenticated) {
      this.gotoHomePage();
      return null;
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
          <h2 className="form-container__title">Log In</h2>
          <LoginForm {...this.props} />
          <h2 className="form-container__divider">Or</h2>
          <GithubButton buttonText="Login with Github" />
          <p className="form__navigation-options">
            Don&apos;t have an account?&nbsp;
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

LoginView.propTypes = {
  previousPath: PropTypes.string.isRequired,
  user: {
    authenticated: PropTypes.bool
  }
};

LoginView.defaultProps = {
  user: {
    authenticated: false
  }
};

export default reduxForm({
  form: 'login',
  fields: ['email', 'password'],
  validate: validateLogin
}, mapStateToProps, mapDispatchToProps)(LoginView);
