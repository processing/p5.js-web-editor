import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { domOnlyProps } from '../../../utils/reduxFormUtils';
import Button from '../../../common/Button';

function ResetPasswordForm(props) {
  const {
    fields: { email }, handleSubmit, submitting, invalid, pristine, t
  } = props;
  return (
    <form
      className="form"
      onSubmit={handleSubmit(props.initiateResetPassword.bind(this))}
    >
      <p className="form__field">
        <label htmlFor="email" className="form__label">{t('ResetPasswordForm.Email')}</label>
        <input
          className="form__input"
          aria-label={t('ResetPasswordForm.EmailARIA')}
          type="text"
          id="email"
          {...domOnlyProps(email)}
        />
        {email.touched && email.error && (
          <span className="form-error">{email.error}</span>
        )}
      </p>
      <Button
        type="submit"
        disabled={submitting || invalid || pristine || props.user.resetPasswordInitiate}
      >{t('ResetPasswordForm.Submit')}
      </Button>
    </form>
  );
}

ResetPasswordForm.propTypes = {
  fields: PropTypes.shape({
    email: PropTypes.objectOf(PropTypes.shape()).isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  initiateResetPassword: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  pristine: PropTypes.bool,
  user: PropTypes.shape({
    resetPasswordInitiate: PropTypes.bool
  }).isRequired,
  t: PropTypes.func.isRequired
};

ResetPasswordForm.defaultProps = {
  submitting: false,
  pristine: true,
  invalid: false,
};

export default withTranslation()(ResetPasswordForm);
