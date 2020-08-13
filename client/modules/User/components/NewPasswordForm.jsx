import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { domOnlyProps } from '../../../utils/reduxFormUtils';
import Button from '../../../common/Button';

function NewPasswordForm(props) {
  const {
    fields: { password, confirmPassword }, handleSubmit, submitting, invalid, pristine,
    t
  } = props;
  return (
    <form className="form" onSubmit={handleSubmit(props.updatePassword.bind(this, props.params.reset_password_token))}>
      <p className="form__field">
        <label htmlFor="password" className="form__label">{t('NewPasswordForm.Title')}</label>
        <input
          className="form__input"
          aria-label={t('NewPasswordForm.TitleARIA')}
          type="password"
          id="Password"
          {...domOnlyProps(password)}
        />
        {password.touched && password.error && <span className="form-error">{password.error}</span>}
      </p>
      <p className="form__field">
        <label htmlFor="confirm password" className="form__label">{t('NewPasswordForm.ConfirmPassword')}</label>
        <input
          className="form__input"
          type="password"
          aria-label={t('NewPasswordForm.ConfirmPasswordARIA')}
          id="confirm password"
          {...domOnlyProps(confirmPassword)}
        />
        {
          confirmPassword.touched &&
          confirmPassword.error &&
          <span className="form-error">{confirmPassword.error}</span>
        }
      </p>
      <Button type="submit" disabled={submitting || invalid || pristine}>{t('NewPasswordForm.SubmitSetNewPassword')}</Button>
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
  t: PropTypes.func.isRequired
};

NewPasswordForm.defaultProps = {
  invalid: false,
  pristine: true,
  submitting: false
};

export default withTranslation()(NewPasswordForm);
