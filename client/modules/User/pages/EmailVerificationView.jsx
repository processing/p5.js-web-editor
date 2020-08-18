import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { withTranslation } from 'react-i18next';
import get from 'lodash/get';
import { Helmet } from 'react-helmet';
import { verifyEmailConfirmation } from '../actions';
import Nav from '../../../components/Nav';


class EmailVerificationView extends React.Component {
  static defaultProps = {
    emailVerificationTokenState: null,
  }

  componentWillMount() {
    const verificationToken = this.verificationToken();
    if (verificationToken != null) {
      this.props.verifyEmailConfirmation(verificationToken);
    }
  }

  verificationToken = () => get(this.props, 'location.query.t', null);

  render() {
    let status = null;
    const {
      emailVerificationTokenState,
    } = this.props;

    if (this.verificationToken() == null) {
      status = (
        <p>{this.props.t('EmailVerificationView.InvalidTokenNull')}</p>
      );
    } else if (emailVerificationTokenState === 'checking') {
      status = (
        <p>{this.props.t('EmailVerificationView.Checking')}</p>
      );
    } else if (emailVerificationTokenState === 'verified') {
      status = (
        <p>{this.props.t('EmailVerificationView.Verified')}</p>
      );
      setTimeout(() => browserHistory.push('/'), 1000);
    } else if (emailVerificationTokenState === 'invalid') {
      status = (
        <p>{this.props.t('EmailVerificationView.InvalidState')}</p>
      );
    }

    return (
      <div className="email-verification">
        <Nav layout="dashboard" />
        <div className="form-container">
          <Helmet>
            <title>{this.props.t('EmailVerificationView.Title')}</title>
          </Helmet>
          <div className="form-container__content">
            <h2 className="form-container__title">{this.props.t('EmailVerificationView.Verify')}</h2>
            {status}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    emailVerificationTokenState: state.user.emailVerificationTokenState,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    verifyEmailConfirmation,
  }, dispatch);
}


EmailVerificationView.propTypes = {
  emailVerificationTokenState: PropTypes.oneOf([
    'checking', 'verified', 'invalid'
  ]),
  verifyEmailConfirmation: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(EmailVerificationView));
