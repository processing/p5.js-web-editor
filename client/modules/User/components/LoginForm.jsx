import PropTypes from 'prop-types';
import React from 'react';
import { domOnlyProps } from '../../../utils/reduxFormUtils';

function LoginForm(props) {
  const { fields: { email, password }, handleSubmit, submitting, pristine } = props;
  return (
    <form className="form" onSubmit={handleSubmit(props.validateAndLoginUser.bind(this, props.previousPath))}>
      <p className="form__field">
        <label htmlFor="email" className="form__label">Email or Username</label>
        <input
          className="form__input"
          aria-label="email or username"
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
      <input type="submit" disabled={submitting || pristine} value="Log In" aria-label="login" />
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
  pristine: PropTypes.bool,
  previousPath: PropTypes.string.isRequired
};

LoginForm.defaultProps = {
  submitting: false,
  pristine: true,
  invalid: false
};

export default LoginForm;
