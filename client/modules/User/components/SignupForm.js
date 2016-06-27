import React, { PropTypes } from 'react';

function SignupForm(props) {
  const { fields: { username, email, password, confirmPassword }, handleSubmit } = props;
  return (
    <form className="signup-form" onSubmit={handleSubmit(props.signUpUser.bind(this))}>
      <p className="signup-form__field">
        <label className="signup-form__username-label" htmlFor="username">Username:</label>
        <input
          className="signup-form__username-input"
          id="username"
          type="text"
          placeholder="Username"
          {...username}
        />
      </p>
      <p className="signup-form__field">
        <label className="signup-form__email-label" htmlFor="email">Email:</label>
        <input
          className="signup-form__email-input"
          id="email"
          type="text"
          placeholder="Email"
          {...email}
        />
      </p>
      <p className="signup-form__field">
        <label className="signup-form__password-label" htmlFor="password">Password:</label>
        <input
          className="signup-form__password-input"
          id="password"
          type="password"
          placeholder="Password"
          {...password}
        />
      </p>
      <p className="signup-form__field">
        <label
          className="signup-form__confirm-password-label"
          htmlFor="confirm-password"
        >
          Confirm Password:
        </label>
        <input
          className="signup-form__confirm-password-input"
          id="confirm-password"
          type="password"
          placeholder="Confirm Password"
          {...confirmPassword}
        />
      </p>
      <input type="submit" value="Sign Up" />
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
