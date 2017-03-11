import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { Link, browserHistory } from 'react-router';
import InlineSVG from 'react-inlinesvg';
import { validateAndLoginUser } from '../actions';
import AccountForm from '../components/AccountForm';
// import GithubButton from '../components/GithubButton';
const exitUrl = require('../../../images/exit.svg');
const logoUrl = require('../../../images/p5js-logo.svg');


class AccountView extends React.Component {
  constructor(props) {
    super(props);
    this.closeAccountPage = this.closeAccountPage.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);
  }

  closeAccountPage() {
    browserHistory.push(this.props.previousPath);
  }

  gotoHomePage() {
    browserHistory.push('/');
  }

  render() {
    return (
      <div className="form-container">
        <div className="form-container__header">
          <button className="form-container__logo-button" onClick={this.gotoHomePage}>
            <InlineSVG src={logoUrl} alt="p5js Logo" />
          </button>
          <button className="form-container__exit-button" onClick={this.closeAccountPage}>
            <InlineSVG src={exitUrl} alt="Close Account Page" />
          </button>
        </div>
        <div className="form-container__content">
          <h2 className="form-container__title">My Account</h2>
          <AccountForm {...this.props} />
          {/* <h2 className="form-container__divider">Or</h2>
          <GithubButton buttonText="Login with Github" /> */}
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

function mapDispatchToProps() {
  return {
    validateAndLoginUser
  };
}

function validate(formProps) {
  const errors = {};
  if (!formProps.email) {
    errors.email = 'Please enter an email';
  }
  if (!formProps.password) {
    errors.password = 'Please enter a password';
  }
  return errors;
}

AccountView.propTypes = {
  previousPath: PropTypes.string.isRequired
};

export default reduxForm({
  form: 'login',
  fields: ['currentPassword', 'newPassword'],
  validate
}, mapStateToProps, mapDispatchToProps)(AccountView);
