import React from 'react';
import { bindActionCreators } from 'redux';
import * as UserActions from '../actions';
import { reduxForm } from 'redux-form';
import SignupForm from '../components/SignupForm';

class SignupView extends React.Component {
  render() {
    return (
      <div className="signup">
        <h1>Sign Up</h1>
        <SignupForm {...this.props} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(UserActions, dispatch);
}

function validate(formProps) {
  const errors = {};

  if (!formProps.username) {
    errors.username = 'Please enter a username';
  }
  if (!formProps.email) {
    errors.email = 'Please enter an email';
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

// export default connect(mapStateToProps, mapDispatchToProps)(SignupView);
export default reduxForm({
  form: 'signup',
  fields: ['username', 'email', 'password', 'confirmPassword'],
  validate
}, mapStateToProps, mapDispatchToProps)(SignupView);
