import PropTypes from 'prop-types';
import React from 'react';
import { domOnlyProps } from '../../../utils/reduxFormUtils';

function LoginForm(props) {
  const {
    fields: { email, password },
    handleSubmit,
    submitting,
    pristine,
    hidden,
    togglePassword
  } = props;
  return (
    <form className="form" onSubmit={handleSubmit(props.validateAndLoginUser.bind(this, props.previousPath))}>
      <p className="form__field">
        <label htmlFor="email" className="form__label">
          Email or Username
        </label>
        <input className="form__input" aria-label="email or username" type="text" id="email" {...domOnlyProps(email)} />
        {email.touched && email.error && <span className="form-error">{email.error}</span>}
      </p>
      <p className="form__field">
        <label htmlFor="password" className="form__label">
          Password
        </label>
        <input
          className="form__input"
          aria-label="password"
          type={hidden ? 'password' : 'text'}
          id="password"
          {...domOnlyProps(password)}
        />
        <label htmlFor="toggler" className="form__label form__password__toggler">
          <input type="checkbox" onClick={togglePassword} className="form__checkbox__hidden" id="toggler" />
          {hidden ? 'Show' : 'Hide'}
        </label>
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
  hidden: PropTypes.bool,
  togglePassword: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  pristine: PropTypes.bool,
  invalid: PropTypes.bool,
  previousPath: PropTypes.string.isRequired
};

LoginForm.defaultProps = {
  submitting: false,
  pristine: true,
  invalid: false,
  hidden: true
};

export default LoginForm;
