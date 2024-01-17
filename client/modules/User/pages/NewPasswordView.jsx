import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import NewPasswordForm from '../components/NewPasswordForm';
import { validateResetPasswordToken } from '../actions';
import Nav from '../../IDE/components/Header/Nav';
import RootPage from '../../../components/RootPage';

function NewPasswordView() {
  const { t } = useTranslation();
  const params = useParams();
  const resetPasswordToken = params.reset_password_token;
  const resetPasswordInvalid = useSelector(
    (state) => state.user.resetPasswordInvalid
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(validateResetPasswordToken(resetPasswordToken));
  }, [resetPasswordToken]);

  const newPasswordClass = classNames({
    'new-password': true,
    'new-password--invalid': resetPasswordInvalid,
    'form-container': true,
    user: true
  });
  return (
    <RootPage>
      <Nav layout="dashboard" />
      <div className={newPasswordClass}>
        <Helmet>
          <title>{t('NewPasswordView.Title')}</title>
        </Helmet>
        <div className="form-container__content">
          <h2 className="form-container__title">
            {t('NewPasswordView.Description')}
          </h2>
          <NewPasswordForm resetPasswordToken={resetPasswordToken} />
          <p className="new-password__invalid">
            {t('NewPasswordView.TokenInvalidOrExpired')}
          </p>
        </div>
      </div>
    </RootPage>
  );
}

export default NewPasswordView;
