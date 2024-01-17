import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { verifyEmailConfirmation } from '../actions';
import RootPage from '../../../components/RootPage';
import Nav from '../../IDE/components/Header/Nav';

const EmailVerificationView = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const browserHistory = useHistory();
  const emailVerificationTokenState = useSelector(
    (state) => state.user.emailVerificationTokenState
  );
  const verificationToken = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('t');
  }, [location.search]);
  useEffect(() => {
    if (verificationToken) {
      dispatch(verifyEmailConfirmation(verificationToken));
    }
  }, [dispatch, verificationToken]);
  let status = null;
  if (!verificationToken) {
    status = <p>{t('EmailVerificationView.InvalidTokenNull')}</p>;
  } else if (emailVerificationTokenState === 'checking') {
    status = <p>{t('EmailVerificationView.Checking')}</p>;
  } else if (emailVerificationTokenState === 'verified') {
    status = <p>{t('EmailVerificationView.Verified')}</p>;
    setTimeout(() => browserHistory.push('/'), 1000);
  } else if (emailVerificationTokenState === 'invalid') {
    status = <p>{t('EmailVerificationView.InvalidState')}</p>;
  }

  return (
    <RootPage>
      <Nav layout="dashboard" />
      <div className="form-container">
        <Helmet>
          <title>{t('EmailVerificationView.Title')}</title>
        </Helmet>
        <div className="form-container__content">
          <h2 className="form-container__title">
            {t('EmailVerificationView.Verify')}
          </h2>
          {status}
        </div>
      </div>
    </RootPage>
  );
};
export default EmailVerificationView;
