import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import { Link, browserHistory } from 'react-router';
import { Helmet } from 'react-helmet';
import { validateAndLoginUser } from '../actions';
import LoginForm from '../components/LoginForm';
import { validateLogin } from '../../../utils/reduxFormUtils';
import SocialAuthButton from '../components/SocialAuthButton';
import Nav from '../../../components/Nav';

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
      <div className="login">
        <Nav layout="dashboard" />
        <div className="form-container">
          <Helmet>
            <title>p5.js Web Editor | Login</title>
          </Helmet>
          <div className="form-container__content">
            <h2 className="form-container__title">Log In</h2>
            <LoginForm {...this.props} />
            <h2 className="form-container__divider">Or</h2>
            <div className="form-container__stack">
              <SocialAuthButton service={SocialAuthButton.services.github} />
              <SocialAuthButton service={SocialAuthButton.services.google} />
            </div>
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
  user: PropTypes.shape({
    authenticated: PropTypes.bool
  })
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
