import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import * as UserActions from '../actions';
import { reduxForm } from 'redux-form';
import SignupForm from '../components/SignupForm';
import axios from 'axios';
import { Link, browserHistory } from 'react-router';
import InlineSVG from 'react-inlinesvg';
const exitUrl = require('../../../images/exit.svg');
const logoUrl = require('../../../images/p5js-logo.svg');

class SignupView extends React.Component {
  constructor(props) {
    super(props);
    this.closeSignupPage = this.closeSignupPage.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);
  }

  closeSignupPage() {
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
          <button className="form-container__exit-button" onClick={this.closeSignupPage}>
            <InlineSVG src={exitUrl} alt="Close Signup Page" />
          </button>
        </div>
        <div className="form-container__content">
          <h2 className="form-container__title">Sign Up</h2>
          <SignupForm {...this.props} />
          <p className="form__navigation-options">
            Already have an account?&nbsp;
            <Link className="form__login-button" to="/login">Log In</Link>
          </p>
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
  return bindActionCreators(UserActions, dispatch);
}

function asyncValidate(formProps, dispatch, props) {
  const fieldToValidate = props.form._active;
  if (fieldToValidate) {
    const queryParams = {};
    queryParams[fieldToValidate] = formProps[fieldToValidate];
    queryParams.check_type = fieldToValidate;
    return axios.get('/api/signup/duplicate_check', { params: queryParams })
      .then(response => {
        if (response.data.exists) {
          const error = {};
          error[fieldToValidate] = response.data.message;
          throw error;
        }
      });
  }
  return Promise.resolve(true).then(() => {});
}

function validate(formProps) {
  const errors = {};

  if (!formProps.username) {
    errors.username = 'Please enter a username.';
  } else if (!formProps.username.match(/^.{1,20}$/)) {
    errors.username = 'Username must be less than 20 characters.';
  } else if (!formProps.username.match(/^[a-zA-Z0-9._-]{1,20}$/)) {
    errors.username = 'Username must only consist of numbers, letters, periods, dashes, and underscores.';
  }

  if (!formProps.email) {
    errors.email = 'Please enter an email.';
  } else if (!formProps.email.match(/^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!formProps.password) {
    errors.password = 'Please enter a password';
  }
  if (!formProps.confirmPassword) {
    errors.confirmPassword = 'Please enter a password confirmation';
  }

  if (formProps.password !== formProps.confirmPassword) {
    errors.password = 'Passwords must match';
  }

  return errors;
}

function onSubmitFail(errors) {
  console.log(errors);
}

SignupView.propTypes = {
  previousPath: PropTypes.string.isRequired
};

export default reduxForm({
  form: 'signup',
  fields: ['username', 'email', 'password', 'confirmPassword'],
  onSubmitFail,
  validate,
  asyncValidate,
  asyncBlurFields: ['username', 'email']
}, mapStateToProps, mapDispatchToProps)(SignupView);
