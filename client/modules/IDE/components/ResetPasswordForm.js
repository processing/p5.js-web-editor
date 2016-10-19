import React, { PropTypes } from 'react';

function ResetPasswordForm(props) {
  const { fields: { email }, handleSubmit, submitting, invalid, pristine } = props;
  return (
    <form className="reset-password-form" onSubmit={handleSubmit(props.initiateResetPassword.bind(this))}>
      <p className="reset-password-form__field">
        <input
          className="reset-password-form__email-input"
          aria-label="email"
          type="text"
          placeholder="Email used for registration"
          {...email}
        />
      </p>
      <input type="submit" disabled={submitting || invalid || pristine || props.user.resetPasswordInitiate} value="Send password reset email" aria-label="Send email to reset password" />
    </form>
  );
}

ResetPasswordForm.propTypes = {
  fields: PropTypes.shape({
    email: PropTypes.object.isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  initiateResetPassword: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  pristine: PropTypes.bool,
  user: PropTypes.shape({
    resetPasswordInitiate: PropTypes.bool
  })
};

export default ResetPasswordForm;
