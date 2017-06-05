import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import InlineSVG from 'react-inlinesvg';
import get from 'lodash/get';
import { verifyEmailConfirmation } from '../actions';

const exitUrl = require('../../../images/exit.svg');
const logoUrl = require('../../../images/p5js-logo.svg');


class EmailVerificationView extends React.Component {
  constructor(props) {
    super(props);
    this.closeLoginPage = this.closeLoginPage.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);

    this.state = {
      response: null,
    };
  }

  componentWillMount() {
    const verificationToken = get(this.props, 'location.query.t', null);
    if (verificationToken != null) {
      this.props.verifyEmailConfirmation(verificationToken)
        .then(
          response => this.setState({ response }),
        );
    } else {
      this.setState({
        response: { error: 'Link invalid' },
      });
    }
  }

  closeLoginPage() {
    browserHistory.push(this.props.previousPath);
  }

  gotoHomePage() {
    browserHistory.push('/');
  }

  render() {
    let status = null;

    if (this.state.response == null) {
      status = (
        <p>Wait...</p>
      );
    } else if (this.state.response != null && this.state.response.error) {
      status = (
        <p>Something went wrong. {this.state.response.error}</p>
      );
    } else if (this.state.response != null && this.state.response.success) {
      status = (
        <p>All done, your email has been verified.</p>
      );
    }

    return (
      <div className="form-container">
        <div className="form-container__header">
          <button className="form-container__logo-button" onClick={this.gotoHomePage}>
            <InlineSVG src={logoUrl} alt="p5js Logo" />
          </button>
          <button className="form-container__exit-button" onClick={this.closeLoginPage}>
            <InlineSVG src={exitUrl} alt="Close Login Page" />
          </button>
        </div>
        <div className="form-container__content">
          <h2 className="form-container__title">Verify your email</h2>
          {status}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    previousPath: state.ide.previousPath
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    verifyEmailConfirmation,
  }, dispatch);
}


EmailVerificationView.propTypes = {
  previousPath: PropTypes.string.isRequired,
  verifyEmailConfirmation: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailVerificationView);
