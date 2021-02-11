import React from 'react';
import { Link } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import SignupForm from '../components/SignupForm';
import SocialAuthButton from '../components/SocialAuthButton';
import Nav from '../../../components/Nav';

function SignupView() {
  const { t } = useTranslation();
  return (
    <div className="signup">
      <Nav layout="dashboard" />
      <main className="form-container">
        <Helmet>
          <title>{t('SignupView.Title')}</title>
        </Helmet>
        <div className="form-container__content">
          <h2 className="form-container__title">
            {t('SignupView.Description')}
          </h2>
          <SignupForm />
          <h2 className="form-container__divider">{t('SignupView.Or')}</h2>
          <div className="form-container__stack">
            <SocialAuthButton service={SocialAuthButton.services.github} />
            <SocialAuthButton service={SocialAuthButton.services.google} />
          </div>
          <p className="form__navigation-options">
            {t('SignupView.AlreadyHave')}
            <Link className="form__login-button" to="/login">
              {t('SignupView.Login')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default SignupView;
