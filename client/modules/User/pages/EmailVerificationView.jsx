import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import browserHistory from '../../../browserHistory';
import { verifyEmailConfirmation } from '../actions';
import Nav from '../../IDE/components/Header/Nav';
import RootPage from '../../../components/RootPage';

class EmailVerificationView extends React.Component {
  static defaultProps = {
    emailVerificationTokenState: null
  };

  componentWillMount() {
    const verificationToken = this.verificationToken();
    if (verificationToken != null) {
      this.props.verifyEmailConfirmation(verificationToken);
    }
  }

  verificationToken = () => {
    const { location } = this.props;
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('t');
  };

  render() {
    let status = null;
    const { emailVerificationTokenState } = this.props;

    if (this.verificationToken() == null) {
      status = <p>{this.props.t('EmailVerificationView.InvalidTokenNull')}</p>;
    } else if (emailVerificationTokenState === 'checking') {
      status = <p>{this.props.t('EmailVerificationView.Checking')}</p>;
    } else if (emailVerificationTokenState === 'verified') {
      status = <p>{this.props.t('EmailVerificationView.Verified')}</p>;
      setTimeout(() => browserHistory.push('/'), 1000);
    } else if (emailVerificationTokenState === 'invalid') {
      status = <p>{this.props.t('EmailVerificationView.InvalidState')}</p>;
    }

    return (
      <RootPage>
        <Nav layout="dashboard" />
        <div className="form-container">
          <Helmet>
            <title>{this.props.t('EmailVerificationView.Title')}</title>
          </Helmet>
          <div className="form-container__content">
            <h2 className="form-container__title">
              {this.props.t('EmailVerificationView.Verify')}
            </h2>
            {status}
          </div>
        </div>
      </RootPage>
    );
  }
}

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
