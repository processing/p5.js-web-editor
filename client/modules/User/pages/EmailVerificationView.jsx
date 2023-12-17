import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import browserHistory from '../../../browserHistory';
import { verifyEmailConfirmation } from '../actions';
import RootPage from '../../../components/RootPage';
import Nav from '../../IDE/components/Header/Nav';

const EmailVerificationView = (props) => {
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const { emailVerificationTokenState, location, t } = props;

  const verificationTokenFromLocation = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('t');
  };

  useEffect(() => {
    const verificationToken = verificationTokenFromLocation();
    if (verificationToken != null && !verificationAttempted) {
      props.verifyEmailConfirmation(verificationToken);
      setVerificationAttempted(true);
    }
  }, [location, props]);

  let status = null;

  if (verificationTokenFromLocation() == null) {
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

EmailVerificationView.defaultProps = {
  emailVerificationTokenState: null
};

EmailVerificationView.propTypes = {
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

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(EmailVerificationView)
);
