import React from 'react';
import { Form, Field } from 'react-final-form';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Button from '../../../common/Button';
import { validateSettings } from '../../../utils/reduxFormUtils';
import { updateSettings, initiateVerification } from '../actions';
import apiClient from '../../../utils/apiClient';

function asyncValidate(fieldToValidate, value) {
  if (!value || value.trim().length === 0) {
    return '';
  }
  const queryParams = {};
  queryParams[fieldToValidate] = value;
  queryParams.check_type = fieldToValidate;
  return apiClient
    .get('/signup/duplicate_check', { params: queryParams })
    .then((response) => {
      if (response.data.exists) {
        return response.data.message;
      }
      return '';
    });
}

function AccountForm() {
  const { t } = useTranslation();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleInitiateVerification = (evt) => {
    evt.preventDefault();
    dispatch(initiateVerification());
  };

  function validateUsername(username) {
    if (username === user.username) return '';
    return asyncValidate('username', username);
  }

  function validateEmail(email) {
    if (email === user.email) return '';
    return asyncValidate('email', email);
  }

  function onSubmit(formProps) {
    return dispatch(updateSettings(formProps));
  }

  return (
    <Form
      fields={['username', 'email', 'currentPassword', 'newPassword']}
      validate={validateSettings}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, submitting, invalid, restart }) => (
        <form
          className="form"
          onSubmit={(event) => {
            handleSubmit(event).then(restart);
          }}
        >
          <Field
            name="email"
            validate={validateEmail}
            validateFields={[]}
            initialValue={user.email}
          >
            {(field) => (
              <p className="form__field">
                <label htmlFor="email" className="form__label">
                  {t('AccountForm.Email')}
                </label>
                <input
                  className="form__input"
                  aria-label={t('AccountForm.EmailARIA')}
                  type="email"
                  id="email"
                  autoComplete="email"
                  {...field.input}
                />
                {field.meta.touched && field.meta.error && (
                  <span className="form-error">{field.meta.error}</span>
                )}
              </p>
            )}
          </Field>
          {user.verified !== 'verified' && (
            <p className="form__context">
              <span className="form__status">
                {t('AccountForm.Unconfirmed')}
              </span>
              {user.emailVerificationInitiate === true ? (
                <span className="form__status">
                  {' '}
                  {t('AccountForm.EmailSent')}
                </span>
              ) : (
                <Button
                  onClick={handleInitiateVerification}
                  className="form__resend-button"
                >
                  {t('AccountForm.Resend')}
                </Button>
              )}
            </p>
          )}
          <Field
            name="username"
            validate={validateUsername}
            validateFields={[]}
            initialValue={user.username}
          >
            {(field) => (
              <p className="form__field">
                <label htmlFor="username" className="form__label">
                  {t('AccountForm.UserName')}
                </label>
                <input
                  className="form__input"
                  aria-label={t('AccountForm.UserNameARIA')}
                  type="text"
                  id="username"
                  autoComplete="username"
                  {...field.input}
                />
                {field.meta.touched && field.meta.error && (
                  <span className="form-error">{field.meta.error}</span>
                )}
              </p>
            )}
          </Field>
          {user.github === undefined && user.google === undefined && (
            <Field name="currentPassword">
              {(field) => (
                <p className="form__field">
                  <label htmlFor="current password" className="form__label">
                    {t('AccountForm.CurrentPassword')}
                  </label>
                  <input
                    className="form__input"
                    aria-label={t('AccountForm.CurrentPasswordARIA')}
                    type="password"
                    id="currentPassword"
                    autoComplete="current-password"
                    {...field.input}
                  />
                  {field.meta.touched && field.meta.error && (
                    <span className="form-error">{field.meta.error}</span>
                  )}
                </p>
              )}
            </Field>
          )}
          {user.github === undefined && user.google === undefined && (
            <Field name="newPassword">
              {(field) => (
                <p className="form__field">
                  <label htmlFor="new password" className="form__label">
                    {t('AccountForm.NewPassword')}
                  </label>
                  <input
                    className="form__input"
                    aria-label={t('AccountForm.NewPasswordARIA')}
                    type="password"
                    id="newPassword"
                    autoComplete="new-password"
                    {...field.input}
                  />
                  {field.meta.touched && field.meta.error && (
                    <span className="form-error">{field.meta.error}</span>
                  )}
                </p>
              )}
            </Field>
          )}
          <Button type="submit" disabled={submitting || invalid}>
            {t('AccountForm.SubmitSaveAllSettings')}
          </Button>
        </form>
      )}
    </Form>
  );
}

export default AccountForm;
