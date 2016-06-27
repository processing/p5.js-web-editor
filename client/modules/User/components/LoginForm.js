import React, { PropTypes } from 'react';

function LoginForm(props) {
  const { fields: { email, password }, handleSubmit } = props;
  return (
    <form className="login-form" onSubmit={handleSubmit(props.loginUser.bind(this))}>
      <p className="login-form__field">
        <label className="login-form__email-label" htmlFor="email">Email:</label>
        <input
          className="login-form__email-input"
          id="email"
          type="text"
          placeholder="Email"
          {...email}
        />
      </p>
      <p className="login-form__field">
        <label className="signup-form__password-label" htmlFor="password">Password:</label>
        <input
          className="signup-form__password-input"
          id="password"
          type="password"
          placeholder="Password"
          {...password}
        />
      </p>
      <input type="submit" value="Login" />
    </form>
  );
}

LoginForm.propTypes = {
  fields: PropTypes.shape({
    email: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loginUser: PropTypes.func.isRequired
};

export default LoginForm;
