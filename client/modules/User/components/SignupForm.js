import React, { PropTypes } from 'react';

function SignupForm(props) {
  const { fields: { username, email, password, confirmPassword }, handleSubmit } = props;
  return (
    <form className="signup-form" onSubmit={handleSubmit(props.signUpUser.bind(this))}>
      <p className="signup-form__field">
        <input
          className="signup-form__username-input"
          aria-label="username"
          type="text"
          placeholder="Username"
          {...username}
        />
      </p>
      <p className="signup-form__field">
        <input
          className="signup-form__email-input"
          aria-label="email"
          type="text"
          placeholder="Email"
          {...email}
        />
      </p>
      <p className="signup-form__field">
        <input
          className="signup-form__password-input"
          aria-label="password"
          type="password"
          placeholder="Password"
          {...password}
        />
      </p>
      <p className="signup-form__field">
        <input
          className="signup-form__confirm-password-input"
          type="password"
          placeholder="Confirm Password"
          aria-label="confirm password"
          {...confirmPassword}
        />
      </p>
      <input type="submit" value="Sign Up" aria-label="sign up" />
    </form>
  );
}

SignupForm.propTypes = {
  fields: PropTypes.shape({
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    confirmPassword: PropTypes.string.isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  signUpUser: PropTypes.func.isRequired
};

export default SignupForm;
