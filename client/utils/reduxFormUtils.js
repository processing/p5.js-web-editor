/* eslint-disable */
import i18n from 'i18next';
export const domOnlyProps = ({
  initialValue,
  autofill,
  onUpdate,
  valid,
  invalid,
  dirty,
  pristine,
  active,
  touched,
  visited,
  autofilled,
  error,
  ...domProps }) => domProps;
/* eslint-enable */

// eslint-disable-next-line max-len
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;

function validateNameEmail(formProps, errors) {
  if (!formProps.username) {
    errors.username = i18n.t('ReduxFormUtils.errorEmptyUsername');
  } else if (!formProps.username.match(/^.{1,20}$/)) {
    errors.username = i18n.t('ReduxFormUtils.errorLongUsername');
  } else if (!formProps.username.match(/^[a-zA-Z0-9._-]{1,20}$/)) {
    errors.username = i18n.t('ReduxFormUtils.errorValidUsername');
  }

  if (!formProps.email) {
    errors.email = i18n.t('ReduxFormUtils.errorEmptyEmail');
  } else if (
    // eslint-disable-next-line max-len
    !formProps.email.match(EMAIL_REGEX)) {
    errors.email = i18n.t('ReduxFormUtils.errorInvalidEmail');
  }
}

export function validateSettings(formProps) {
  const errors = {};

  validateNameEmail(formProps, errors);

  if (formProps.currentPassword && !formProps.newPassword) {
    errors.newPassword = i18n.t('ReduxFormUtils.errorNewPassword');
  }
  if (formProps.newPassword && formProps.newPassword.length < 6) {
    errors.newPassword = i18n.t('ReduxFormUtils.errorShortPassword');
  }
  return errors;
}

export function validateLogin(formProps) {
  const errors = {};
  if (!formProps.email) {
    errors.email = i18n.t('ReduxFormUtils.errorEmptyEmail');
  }
  if (!formProps.password) {
    errors.password = i18n.t('ReduxFormUtils.errorEmptyPassword');
  }
  return errors;
}

export function validateSignup(formProps) {
  const errors = {};

  validateNameEmail(formProps, errors);

  if (!formProps.password) {
    errors.password = i18n.t('ReduxFormUtils.errorEmptyPassword');
  }
  if (formProps.password && formProps.password.length < 6) {
    errors.password = i18n.t('ReduxFormUtils.errorShortPassword');
  }
  if (!formProps.confirmPassword) {
    errors.confirmPassword = i18n.t('ReduxFormUtils.errorConfirmPassword');
  }

  if (formProps.password !== formProps.confirmPassword && formProps.confirmPassword) {
    errors.confirmPassword = i18n.t('ReduxFormUtils.errorPasswordMismatch');
  }

  return errors;
}
export function validateResetPassword(formProps) {
  const errors = {};
  if (!formProps.email) {
    errors.email = i18n.t('ReduxFormUtils.errorEmptyEmail');
  } else if (
    // eslint-disable-next-line max-len
    !formProps.email.match(EMAIL_REGEX)) {
    errors.email = i18n.t('ReduxFormUtils.errorInvalidEmail');
  }
  return errors;
}
