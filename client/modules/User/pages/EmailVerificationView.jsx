import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
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
        <p>That link is invalid.</p>
      );
    } else if (emailVerificationTokenState === 'checking') {
      status = (
        <p>Validating token, please wait...</p>
      );
    } else if (emailVerificationTokenState === 'verified') {
      status = (
        <p>All done, your email address has been verified.</p>
      );
      setTimeout(() => browserHistory.push('/'), 1000);
    } else if (emailVerificationTokenState === 'invalid') {
      status = (
        <p>Something went wrong.</p>
      );
    }

    return (
      <div className="email-verification">
        <Nav layout="dashboard" />
        <div className="form-container">
          <Helmet>
            <title>p5.js Web Editor | Email Verification</title>
          </Helmet>
          <div className="form-container__content">
            <h2 className="form-container__title">Verify your email</h2>
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
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailVerificationView);
