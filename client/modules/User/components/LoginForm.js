import React from 'react';

class LoginForm extends React.Component {
  render() {
    const { fields: { email, password }, handleSubmit } = this.props;
    return (
      <form className="login-form" onSubmit={handleSubmit(this.props.loginUser.bind(this))}>
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
}

export default LoginForm;
