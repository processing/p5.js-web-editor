import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import prettyBytes from 'pretty-bytes';
import { getConfig } from '../../../utils/getConfig';
import { parseNumber } from '../../../utils/parseStringToType';

const uploadLimit = parseNumber(getConfig('UPLOAD_LIMIT')) || 250000000;
const uploadLimitText = prettyBytes(uploadLimit);

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

  function uploadLimitReached() {
    return (
      <p>
        {t('UploadFileModal.SizeLimitError', { sizeLimit: uploadLimitText })}
        <Link to="/assets" onClick={closeModal}>
          assets
        </Link>
        .
      </p>
    );
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
        } else if (type === 'uploadLimit') {
          return uploadLimitReached();
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
    'oauthError',
    'uploadLimit'
  ]).isRequired,
  closeModal: PropTypes.func.isRequired,
  service: PropTypes.oneOf(['google', 'github'])
};

ErrorModal.defaultProps = {
  service: ''
};

export default ErrorModal;
