import PropTypes from 'prop-types';
import React from 'react';
import { domOnlyProps } from '../../../utils/reduxFormUtils';

function ResetPasswordForm(props) {
  const { fields: { email }, handleSubmit, submitting, invalid, pristine } = props;
  return (
    <form className="form" onSubmit={handleSubmit(props.initiateResetPassword.bind(this))}>
      <p className="form__field">
        <label htmlFor="email" className="form__label">Email used for registration</label>
        <input
          className="form__input"
          aria-label="email"
          type="text"
          id="email"
          {...domOnlyProps(email)}
        />
      </p>
      <input
        type="submit"
        disabled={submitting || invalid || pristine || props.user.resetPasswordInitiate}
        value="Send Password Reset Email"
        aria-label="Send email to reset password"
      />
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
  }).isRequired
};

ResetPasswordForm.defaultProps = {
  submitting: false,
  pristine: true,
  invalid: false
};

export default ResetPasswordForm;
