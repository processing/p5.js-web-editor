import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import ResetPasswordForm from '../components/ResetPasswordForm';
import Nav from '../../../components/Nav';

function ResetPasswordView() {
  const { t } = useTranslation();
  const resetPasswordInitiate = useSelector(state => state.user.resetPasswordInitiate);
  const resetPasswordClass = classNames({
    'reset-password': true,
    'reset-password--submitted': resetPasswordInitiate,
    'form-container': true,
    'user': true
  });
  return (
    <div className="reset-password-container">
      <Nav layout="dashboard" />
      <div className={resetPasswordClass}>
        <Helmet>
          <title>{t('ResetPasswordView.Title')}</title>
        </Helmet>
        <div className="form-container__content">
          <h2 className="form-container__title">{t('ResetPasswordView.Reset')}</h2>
          <ResetPasswordForm />
          <p className="reset-password__submitted">
            {t('ResetPasswordView.Submitted')}
          </p>
          <p className="form__navigation-options">
            <Link className="form__login-button" to="/login">{t('ResetPasswordView.Login')}</Link>
            &nbsp;{t('ResetPasswordView.LoginOr')}&nbsp;
            <Link className="form__signup-button" to="/signup">{t('ResetPasswordView.SignUp')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordView;
