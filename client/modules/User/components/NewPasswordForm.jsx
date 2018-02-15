import PropTypes from 'prop-types';
import React from 'react';
import { domOnlyProps } from '../../../utils/reduxFormUtils';

function NewPasswordForm(props) {
  const { fields: { password, confirmPassword }, handleSubmit, submitting, invalid, pristine } = props;
  return (
    <form className="form" onSubmit={handleSubmit(props.updatePassword.bind(this, props.params.reset_password_token))}>
      <p className="form__field">
        <label htmlFor="password" className="form__label">Password</label>
        <input
          className="form__input"
          aria-label="password"
          type="password"
          id="Password"
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
      <input type="submit" disabled={submitting || invalid || pristine} value="Set New Password" aria-label="sign up" />
    </form>
  );
}

NewPasswordForm.propTypes = {
  fields: PropTypes.shape({
    password: PropTypes.object.isRequired,
    confirmPassword: PropTypes.object.isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  updatePassword: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  pristine: PropTypes.bool,
  params: PropTypes.shape({
    reset_password_token: PropTypes.string,
  }).isRequired,
};

NewPasswordForm.defaultProps = {
  invalid: false,
  pristine: true,
  submitting: false
};

export default NewPasswordForm;
