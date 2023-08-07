import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ErrorModal = ({ type, service, closeModal }) => {
  const { t } = useTranslation();

  function forceAuthentication() {
    return (
      <p>
        {t('ErrorModal.MessageLogin')}
        <Link to="/login" onClick={closeModal}>
          {' '}
          {t('ErrorModal.Login')}
        </Link>
        {t('ErrorModal.LoginOr')}
        <Link to="/signup" onClick={closeModal}>
          {t('ErrorModal.SignUp')}
        </Link>
        .
      </p>
    );
  }

  function oauthError() {
    const serviceLabels = {
      github: 'GitHub',
      google: 'Google'
    };
    return (
      <p>
        {t('ErrorModal.LinkMessage', { serviceauth: serviceLabels[service] })}
      </p>
    );
  }

  function staleSession() {
    return (
      <p>
        {t('ErrorModal.MessageLoggedOut')}
        <Link to="/login" onClick={closeModal}>
          {t('ErrorModal.LogIn')}
        </Link>
        .
      </p>
    );
  }

  function staleProject() {
    return <p>{t('ErrorModal.SavedDifferentWindow')}</p>;
  }

  return (
    <div className="error-modal__content">
      {(() => { // eslint-disable-line
        if (type === 'forceAuthentication') {
          return forceAuthentication();
        } else if (type === 'staleSession') {
          return staleSession();
        } else if (type === 'staleProject') {
          return staleProject();
        } else if (type === 'oauthError') {
          return oauthError();
        }
      })()}
    </div>
  );
};

ErrorModal.propTypes = {
  type: PropTypes.oneOf([
    'forceAuthentication',
    'staleSession',
    'staleProject',
    'oauthError'
  ]).isRequired,
  closeModal: PropTypes.func.isRequired,
  service: PropTypes.oneOf(['google', 'github'])
};

ErrorModal.defaultProps = {
  service: ''
};

export default ErrorModal;
