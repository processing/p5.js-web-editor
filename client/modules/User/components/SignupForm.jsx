import PropTypes from 'prop-types';
import React from 'react';
import { domOnlyProps } from '../../../utils/reduxFormUtils';

function SignupForm(props) {
  const { fields: { username, email, password, confirmPassword }, handleSubmit, submitting, invalid, pristine } = props;
  return (
    <form className="form" onSubmit={handleSubmit(props.signUpUser.bind(this, props.previousPath))}>
      <p className="form__field">
        <label htmlFor="username" className="form__label">User Name</label>
        <input
          className="form__input"
          aria-label="username"
          type="text"
          id="username"
          {...domOnlyProps(username)}
        />
        {username.touched && username.error && <span className="form-error">{username.error}</span>}
      </p>
      <p className="form__field">
        <label htmlFor="email" className="form__label">Email</label>
        <input
          className="form__input"
          aria-label="email"
          type="text"
          id="email"
          {...domOnlyProps(email)}
        />
        {email.touched && email.error && <span className="form-error">{email.error}</span>}
      </p>
      <p className="form__field">
        <label htmlFor="password" className="form__label">Password</label>
        <input
          className="form__input"
          aria-label="password"
          type="password"
          id="password"
          {...domOnlyProps(password)}
        />
        {password.touched && password.error && <span className="form-error">{password.error}</span>}
      </p>
      <p className="form__field">
        <label htmlFor="confirm password" className="form__label">Confirm Password</label>
        <input
          className="form__input"
          type="password"
          aria-label="confirm password"
          id="confirm password"
          {...domOnlyProps(confirmPassword)}
        />
        {
          confirmPassword.touched &&
          confirmPassword.error &&
          <span className="form-error">{confirmPassword.error}</span>
        }
      </p>
      <input type="submit" disabled={submitting || invalid || pristine} value="Sign Up" aria-label="sign up" />
    </form>
  );
}

SignupForm.propTypes = {
  fields: PropTypes.shape({
    username: PropTypes.object.isRequired,
    email: PropTypes.object.isRequired,
    password: PropTypes.object.isRequired,
    confirmPassword: PropTypes.object.isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  signUpUser: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  pristine: PropTypes.bool,
  previousPath: PropTypes.string.isRequired
};

SignupForm.defaultProps = {
  submitting: false,
  pristine: true,
  invalid: false
};

export default SignupForm;
