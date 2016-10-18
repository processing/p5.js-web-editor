import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import NewPasswordForm from './NewPasswordForm';
import * as UserActions from '../../User/actions';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { Link } from 'react-router';

class NewPasswordView extends React.Component {
  componentDidMount() {
    this.refs.newPassword.focus();
    // need to check if this is a valid token
    this.props.validateResetPasswordToken(this.props.token);
  }

  render() {
    const newPasswordClass = classNames({
      'new-password': true,
      'new-password--invalid': this.props.user.resetPasswordInvalid
    });
    console.log(this.props.user);
    console.log('rerendering!!');
    return (
      <div className={newPasswordClass} ref="newPassword" tabIndex="0">
        <h1>Set a New Password</h1>
        <NewPasswordForm {...this.props} />
        <p className="new-password__invalid">
          The password reset token is invalid or has expired.
        </p>
        <Link className="form__cancel-button" to="/">Close</Link>
      </div>
    );
  }
}

NewPasswordView.propTypes = {
  token: PropTypes.string.isRequired,
  validateResetPasswordToken: PropTypes.func.isRequired,
  user: PropTypes.shape({
    resetPasswordInvalid: PropTypes.bool
  })
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
