import React, { PropTypes } from 'react';

function LoginForm(props) {
  const { fields: { email, password }, handleSubmit, submitting, pristine } = props;
  return (
    <form className="login-form" onSubmit={handleSubmit(props.validateAndLoginUser.bind(this, props.previousPath))}>
      <p className="login-form__field">
        <input
          className="login-form__email-input"
          aria-label="email"
          type="text"
          placeholder="Email"
          {...email}
        />
        {email.touched && email.error && <span className="form-error">{email.error}</span>}
      </p>
      <p className="login-form__field">
        <input
          className="signup-form__password-input"
          aria-label="password"
          type="password"
          placeholder="Password"
          {...password}
        />
        {password.touched && password.error && <span className="form-error">{password.error}</span>}
      </p>
      <input type="submit" disabled={submitting || pristine} value="Login" aria-label="login" />
    </form>
  );
}

LoginForm.propTypes = {
  fields: PropTypes.shape({
    email: PropTypes.object.isRequired,
    password: PropTypes.object.isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  validateAndLoginUser: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  pristine: PropTypes.bool,
  previousPath: PropTypes.string.isRequired
};

export default LoginForm;
