import React from 'react';
import { Form, Field } from 'react-final-form';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { browserHistory } from 'react-router';
import Button from '../../../common/Button';
import { validateSettings } from '../../../utils/reduxFormUtils';
import { submitSettings, initiateVerification, updateSettingsSuccess } from '../actions';
import { showToast, setToastText } from '../../IDE/actions/toast';
import apiClient from '../../../utils/apiClient';

function asyncValidate(fieldToValidate, value) {
  if (!value || value.trim().length === 0) return `Please enter a ${fieldToValidate}.`;
  const queryParams = {};
  queryParams[fieldToValidate] = value;
  queryParams.check_type = fieldToValidate;
  return apiClient.get('/signup/duplicate_check', { params: queryParams })
    .then((response) => {
      if (response.data.exists) {
        return response.data.message;
      }
      return '';
    });
}

function AccountForm() {
  const { t } = useTranslation();
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const handleInitiateVerification = (evt) => {
    evt.preventDefault();
    dispatch(initiateVerification());
  };

  function validateUsername(username, _, meta) {
    if (username === user.username) return '';
    return asyncValidate('username', username);
  }

  function validateEmail(email, _, meta) {
    if (email === user.email) return '';
    return asyncValidate('email', email);
  }

  function updateSettings(formValues) {
    return submitSettings(formValues).then((response) => {
      dispatch(updateSettingsSuccess(response.data));
      // browserHistory.push('/');
      dispatch(showToast(5500));
      dispatch(setToastText('Toast.SettingsSaved'));
    })
      .catch((error) => {
        const { response } = error;
        Promise.reject(new Error(response.data.error));
      });
  }

  return (
    <Form
      fields={['username', 'email', 'currentPassword', 'newPassword']}
      validate={validateSettings}
      onSubmit={updateSettings}
    >
      {({
        handleSubmit, submitting, invalid, restart
      }) => (
        <form
          className="form"
          onSubmit={(event) => {
            handleSubmit(event).then(restart);
          }}
        >
          <Field name="email" validate={validateEmail} validateFields={[]} initialValue={user.email}>
            {field => (
              <p className="form__field">
                <label htmlFor="email" className="form__label">{t('AccountForm.Email')}</label>
                <input
                  className="form__input"
                  aria-label={t('AccountForm.EmailARIA')}
                  type="text"
                  id="email"
                  {...field.input}
                />
                {field.meta.touched && field.meta.error && (
                  <span className="form-error">{field.meta.error}</span>
                )}
              </p>
            )}
          </Field>
          {
            user.verified !== 'verified' &&
            (
              <p className="form__context">
                <span className="form__status">{t('AccountForm.Unconfirmed')}</span>
                {
                  user.emailVerificationInitiate === true ?
                    (
                      <span className="form__status"> {t('AccountForm.EmailSent')}</span>
                    ) :
                    (
                      <Button onClick={handleInitiateVerification}>
                        {t('AccountForm.Resend')}
                      </Button>
                    )
                }
              </p>
            )
          }
          <Field name="username" validate={validateUsername} validateFields={[]} initialValue={user.username}>
            {field => (
              <p className="form__field">
                <label htmlFor="username" className="form__label">{t('AccountForm.UserName')}</label>
                <input
                  className="form__input"
                  aria-label={t('AccountForm.UserNameARIA')}
                  type="text"
                  id="username"
                  {...field.input}
                />
                {field.meta.touched && field.meta.error && (
                  <span className="form-error">{field.meta.error}</span>
                )}
              </p>
            )}
          </Field>
          <Field name="currentPassword">
            {field => (
              <p className="form__field">
                <label htmlFor="current password" className="form__label">{t('AccountForm.CurrentPassword')}</label>
                <input
                  className="form__input"
                  aria-label={t('AccountForm.CurrentPasswordARIA')}
                  type="password"
                  id="currentPassword"
                  {...field.input}
                />
                {field.meta.touched && field.meta.error && (
                  <span className="form-error">{field.meta.error}</span>
                )}
              </p>
            )}
          </Field>
          <Field name="newPassword">
            {field => (
              <p className="form__field">
                <label htmlFor="new password" className="form__label">{t('AccountForm.NewPassword')}</label>
                <input
                  className="form__input"
                  aria-label={t('AccountForm.NewPasswordARIA')}
                  type="password"
                  id="newPassword"
                  {...field.input}
                />
                {field.meta.touched && field.meta.error && (
                  <span className="form-error">{field.meta.error}</span>
                )}
              </p>
            )}
          </Field>
          <Button
            type="submit"
            disabled={submitting || invalid}
          >{t('AccountForm.SubmitSaveAllSettings')}
          </Button>
        </form>
      )}
    </Form>
  );
}

export default AccountForm;
