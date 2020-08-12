
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { reduxForm } from 'redux-form';
import { Helmet } from 'react-helmet';
import { withTranslation } from 'react-i18next';
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
          <title>{props.t('ResetPasswordView.Title')}</title>
        </Helmet>
        <div className="form-container__content">
          <h2 className="form-container__title">{props.t('ResetPasswordView.Reset')}</h2>
          <ResetPasswordForm {...props} />
          <p className="reset-password__submitted">
            {props.t('ResetPasswordView.Submitted')}
          </p>
          <p className="form__navigation-options">
            <Link className="form__login-button" to="/login">{props.t('LoginView.Login')}</Link>
            &nbsp;{props.t('LoginView.LoginOr')}&nbsp;
            <Link className="form__signup-button" to="/signup">{props.t('LoginView.SignUp')}</Link>
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
  t: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(UserActions, dispatch);
}

export default withTranslation()(reduxForm({
  form: 'reset-password',
  fields: ['email'],
  validate: validateResetPassword
}, mapStateToProps, mapDispatchToProps)(ResetPasswordView));
