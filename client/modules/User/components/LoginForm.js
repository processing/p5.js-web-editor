import React, { PropTypes } from 'react';

function LoginForm(props) {
  const { fields: { email, password }, handleSubmit } = props;
  return (
    <form className="login-form" onSubmit={handleSubmit(props.loginUser.bind(this))}>
      <p className="login-form__field">
        <input
          className="login-form__email-input"
          aria-label="email"
          type="text"
          placeholder="Email"
          {...email}
        />
      </p>
      <p className="login-form__field">
        <input
          className="signup-form__password-input"
          aria-label="password"
          type="password"
          placeholder="Password"
          {...password}
        />
      </p>
      <input type="submit" value="Login" aria-label="login" />
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
