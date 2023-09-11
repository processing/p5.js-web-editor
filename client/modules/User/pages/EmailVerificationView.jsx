import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import browserHistory from '../../../browserHistory';
import { verifyEmailConfirmation } from '../actions';
import RootPage from '../../../components/RootPage';
import Nav from '../../IDE/components/Header/Nav';

function EmailVerificationView(props) {
  const {
    emailVerificationTokenState,
    // eslint-disable-next-line no-shadow
    verifyEmailConfirmation,
    t,
    location
  } = props;

  useEffect(() => {
    // eslint-disable-next-line no-use-before-define
    const verificationToken = getVerificationToken();
    if (verificationToken != null) {
      verifyEmailConfirmation(verificationToken);
    }
  }, [verifyEmailConfirmation]);

  const getVerificationToken = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('t');
  };

  let status = null;

  if (getVerificationToken() == null) {
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
}

EmailVerificationView.propTypes = {
  // eslint-disable-next-line react/require-default-props
  emailVerificationTokenState: PropTypes.oneOf([
    'checking',
    'verified',
    'invalid'
  ]),
  verifyEmailConfirmation: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired
  }).isRequired
};

function mapStateToProps(state) {
  return {
    emailVerificationTokenState: state.user.emailVerificationTokenState
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      verifyEmailConfirmation
    },
    dispatch
  );
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(EmailVerificationView)
);
