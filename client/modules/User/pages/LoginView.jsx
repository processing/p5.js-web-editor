import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import { Link, browserHistory } from 'react-router';
import { Helmet } from 'react-helmet';
import { withTranslation } from 'react-i18next';
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
        <main className="form-container">
          <Helmet>
            <title>{this.props.t('LoginView.Title')}</title>
          </Helmet>
          <div className="form-container__content">
            <h2 className="form-container__title">{this.props.t('LoginView.Login')}</h2>
            <LoginForm {...this.props} />
            <h2 className="form-container__divider">{this.props.t('LoginView.LoginOr')}</h2>
            <div className="form-container__stack">
              <SocialAuthButton service={SocialAuthButton.services.github} />
              <SocialAuthButton service={SocialAuthButton.services.google} />
            </div>
            <p className="form__navigation-options">
              {this.props.t('LoginView.DontHaveAccount')}
              <Link className="form__signup-button" to="/signup">{this.props.t('LoginView.SignUp')}</Link>
            </p>
            <p className="form__navigation-options">
              {this.props.t('LoginView.ForgotPassword')}
              <Link
                className="form__reset-password-button"
                to="/reset-password"
              > {this.props.t('LoginView.ResetPassword')}
              </Link>
            </p>
          </div>
        </main>
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
  }),
  t: PropTypes.func.isRequired,
};

LoginView.defaultProps = {
  user: {
    authenticated: false
  },
};

export default withTranslation()(reduxForm({
  form: 'login',
  fields: ['email', 'password'],
  validate: validateLogin
}, mapStateToProps, mapDispatchToProps)(LoginView));
