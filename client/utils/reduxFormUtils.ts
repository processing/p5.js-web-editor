import i18n from 'i18next';

// eslint-disable-next-line max-len
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{1,20}$/;

type Email = { email: string };
type Username = { username: string };
type Password = { password: string };
type ConfirmPassword = { confirmPassword: string };
type CurrentPassword = { currentPassword: string };
type NewPassword = { newPassword: string };

type UsernameAndEmail = Username & Email;
type PasswordsConfirm = Password & ConfirmPassword;

/** Validation errors for site forms */
export type FormErrors = Partial<
  Email & Username & Password & ConfirmPassword & CurrentPassword & NewPassword
>;

// === Internal helper functions: =====

/** Processes form & mutates errors to add any `username` & `email` errors */
function validateUsernameEmail(
  formProps: Partial<UsernameAndEmail>,
  errors: FormErrors
) {
  if (!formProps.username) {
    errors.username = i18n.t('ReduxFormUtils.errorEmptyUsername');
  } else if (formProps.username.length > 20) {
    errors.username = i18n.t('ReduxFormUtils.errorLongUsername');
  } else if (!formProps.username.match(USERNAME_REGEX)) {
    errors.username = i18n.t('ReduxFormUtils.errorValidUsername');
  }

  if (!formProps.email) {
    errors.email = i18n.t('ReduxFormUtils.errorEmptyEmail');
  } else if (!formProps.email.match(EMAIL_REGEX)) {
    errors.email = i18n.t('ReduxFormUtils.errorInvalidEmail');
  }
}

/** Processes form & mutates errors to add any `password` and `confirmPassword` errors */
function validatePasswords(
  formProps: Partial<PasswordsConfirm>,
  errors: FormErrors
) {
  if (!formProps.password) {
    errors.password = i18n.t('ReduxFormUtils.errorEmptyPassword');
  }
  if (formProps.password && formProps.password.length < 6) {
    errors.password = i18n.t('ReduxFormUtils.errorShortPassword');
  }
  if (!formProps.confirmPassword) {
    errors.confirmPassword = i18n.t('ReduxFormUtils.errorConfirmPassword');
  }

  if (
    formProps.password !== formProps.confirmPassword &&
    formProps.confirmPassword
  ) {
    errors.confirmPassword = i18n.t('ReduxFormUtils.errorPasswordMismatch');
  }
}

// ====== PUBLIC: ========

// Account Form:
export type AccountForm = UsernameAndEmail & CurrentPassword & NewPassword;

/** Validation for the Account Form */
export function validateSettings(
  formProps: Partial<AccountForm>
): Partial<AccountForm> {
  const errors: Partial<AccountForm> = {};

  validateUsernameEmail(formProps, errors);

  if (formProps.currentPassword && !formProps.newPassword) {
    errors.newPassword = i18n.t('ReduxFormUtils.errorNewPassword');
  }
  if (formProps.newPassword && formProps.newPassword.length < 6) {
    errors.newPassword = i18n.t('ReduxFormUtils.errorShortPassword');
  }
  if (
    formProps.newPassword &&
    formProps.currentPassword === formProps.newPassword
  ) {
    errors.newPassword = i18n.t('ReduxFormUtils.errorNewPasswordRepeat');
  }
  return errors;
}

// Login form:
export type LoginForm = UsernameAndEmail & Password;

/** Validation for the Login Form */
export function validateLogin(
  formProps: Partial<LoginForm>
): Partial<LoginForm> {
  const errors: Partial<LoginForm> = {};
  if (!formProps.email && !formProps.username) {
    errors.email = i18n.t('ReduxFormUtils.errorEmptyEmailorUserName');
  }
  if (!formProps.password) {
    errors.password = i18n.t('ReduxFormUtils.errorEmptyPassword');
  }
  return errors;
}

export type NewPasswordForm = PasswordsConfirm;

/** Validation for the New Password Form */
export function validateNewPassword(
  formProps: Partial<NewPasswordForm>
): Partial<NewPasswordForm> {
  const errors = {};
  validatePasswords(formProps, errors);
  return errors;
}

// Signup Form:
export type SignupForm = UsernameAndEmail & PasswordsConfirm;

/** Validation for the Signup Form */
export function validateSignup(
  formProps: Partial<SignupForm>
): Partial<SignupForm> {
  const errors = {};

  validateUsernameEmail(formProps, errors);
  validatePasswords(formProps, errors);

  return errors;
}

// Reset Password Form:
export type ResetPasswordForm = Email;

/** Validation for the Reset Password Form */
export function validateResetPassword(
  formProps: Partial<ResetPasswordForm>
): Partial<ResetPasswordForm> {
  const errors: Partial<ResetPasswordForm> = {};
  if (!formProps.email) {
    errors.email = i18n.t('ReduxFormUtils.errorEmptyEmail');
  } else if (!formProps.email.match(EMAIL_REGEX)) {
    errors.email = i18n.t('ReduxFormUtils.errorInvalidEmail');
  }
  return errors;
}
