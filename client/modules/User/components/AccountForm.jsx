import React, { PropTypes } from 'react';
import { domOnlyProps } from '../../../utils/reduxFormUtils';

function AccountForm(props) {
  const {
    fields: { currentPassword, newPassword },
    user: { email, username },
    handleSubmit,
    submitting,
    pristine
  } = props;
  return (
    <form className="form" onSubmit={handleSubmit(props.validateAndLoginUser.bind(this, props.previousPath))}>
      <p className="form__field">
        <label htmlFor="email" className="form__label">Email</label>
        <input
          className="form__input"
          aria-label="email"
          type="text"
          id="email"
          defaultValue={email}
        />
        {email.touched && email.error && <span className="form-error">{email.error}</span>}
      </p>
      <p className="form__field">
        <label htmlFor="username" className="form__label">User Name</label>
        <input
          className="form__input"
          aria-label="username"
          type="text"
          id="username"
          defaultValue={username}
        />
      </p>
      <p className="form__field">
        <label htmlFor="currentPassword" className="form__label">Current Password</label>
        <input
          className="form__input"
          aria-label="currentPassword"
          type="currentPassword"
          id="currentPassword"
          {...domOnlyProps(currentPassword)}
        />
        {currentPassword.touched && currentPassword.error && <span className="form-error">{currentPassword.error}</span>}
      </p>
      <p className="form__field">
        <label htmlFor="newPassword" className="form__label">New Password</label>
        <input
          className="form__input"
          aria-label="newPassword"
          type="newPassword"
          id="newPassword"
          {...domOnlyProps(newPassword)}
        />
        {newPassword.touched && newPassword.error && <span className="form-error">{newPassword.error}</span>}
      </p>
      <input type="submit" disabled={submitting || pristine} value="Save All Settings" aria-label="login" />
    </form>
  );
}

AccountForm.propTypes = {
  fields: PropTypes.shape({
    currentPassword: PropTypes.object.isRequired,
    newPassword: PropTypes.object.isRequired
  }).isRequired,
  user: PropTypes.shape({
    email: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  validateAndLoginUser: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  pristine: PropTypes.bool,
  previousPath: PropTypes.string.isRequired
};

AccountForm.defaultProps = {
  submitting: false,
  pristine: true,
  invalid: false
};

export default AccountForm;
