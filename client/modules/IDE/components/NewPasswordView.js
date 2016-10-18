import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import NewPasswordForm from './NewPasswordForm';
import * as UserActions from '../../User/actions';
import { bindActionCreators } from 'redux';

class NewPasswordView extends React.Component {
  componentDidMount() {
    this.refs.newPassword.focus();
    // need to check if this is a valid token
    this.props.validateResetPasswordToken(this.props.token);
  }

  render() {
    return (
      <div className="new-password" ref="newPassword" tabIndex="0">
        <h1>Set a New Password</h1>
        <NewPasswordForm {...this.props} />
      </div>
    );
  }
}

NewPasswordView.propTypes = {
  token: PropTypes.string.isRequired,
  validateResetPasswordToken: PropTypes.func.isRequired
};

function validate(formProps) {
  const errors = {};

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

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
    token: ownProps.token
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(UserActions, dispatch);
}

export default reduxForm({
  form: 'new-password',
  fields: ['password', 'confirmPassword'],
  validate
}, mapStateToProps, mapDispatchToProps)(NewPasswordView);
