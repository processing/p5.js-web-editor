import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import NewPasswordForm from '../components/NewPasswordForm';
import { validateResetPasswordToken } from '../actions';
import Nav from '../../../components/Nav';

function NewPasswordView(props) {
  const { t } = useTranslation();
  const resetPasswordToken = props.params.reset_password_token;
  const resetPasswordInvalid = useSelector(state => state.user.resetPasswordInvalid);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(validateResetPasswordToken(resetPasswordToken));
  }, [resetPasswordToken]);

  const newPasswordClass = classNames({
    'new-password': true,
    'new-password--invalid': resetPasswordInvalid,
    'form-container': true,
    'user': true
  });
  return (
    <div className="new-password-container">
      <Nav layout="dashboard" />
      <div className={newPasswordClass}>
        <Helmet>
          <title>{t('NewPasswordView.Title')}</title>
        </Helmet>
        <div className="form-container__content">
          <h2 className="form-container__title">{t('NewPasswordView.Description')}</h2>
          <NewPasswordForm resetPasswordToken={resetPasswordToken} />
          <p className="new-password__invalid">
            {t('NewPasswordView.TokenInvalidOrExpired')}
          </p>
        </div>
      </div>
    </div>
  );
}

NewPasswordView.propTypes = {
  params: PropTypes.shape({
    reset_password_token: PropTypes.string,
  }).isRequired
};

export default NewPasswordView;
