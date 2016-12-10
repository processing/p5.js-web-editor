import React, { PropTypes } from 'react';
import { domOnlyProps } from '../../../utils/reduxFormUtils';

function NewPasswordForm(props) {
  const { fields: { password, confirmPassword }, handleSubmit, submitting, invalid, pristine } = props;
  return (
    <form className="new-password-form" onSubmit={handleSubmit(props.updatePassword.bind(this, props.token))}>
      <p className="new-password-form__field">
        <input
          className="new-password-form__password-input"
          aria-label="password"
          type="password"
          placeholder="Password"
          {...domOnlyProps(password)}
        />
        {password.touched && password.error && <span className="form-error">{password.error}</span>}
      </p>
      <p className="new-password-form__field">
        <input
          className="new-password-form__confirm-password-input"
          type="password"
          placeholder="Confirm Password"
          aria-label="confirm password"
          {...domOnlyProps(confirmPassword)}
        />
        {confirmPassword.touched && confirmPassword.error && <span className="form-error">{confirmPassword.error}</span>}
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
  token: PropTypes.string.isRequired
};

export default NewPasswordForm;
