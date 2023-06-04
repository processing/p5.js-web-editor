import React from 'react';
import { Form } from 'react-final-form';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Button from '../../../common/Button';
import FinalFormField from '../../../common/FinalFormField';
import { validateSettings } from '../../../utils/reduxFormUtils';
import { updateSettings, initiateVerification } from '../actions';
import apiClient from '../../../utils/apiClient';

function asyncValidate(fieldToValidate, value) {
  if (!value || value.trim().length === 0)
    return `Please enter a ${fieldToValidate}.`;
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
          <FinalFormField
            name="email"
            id="email"
            type="email"
            autoComplete="email"
            label={t('AccountForm.Email')}
            ariaLabel={t('AccountForm.EmailARIA')}
            validate={validateEmail}
            validateFields={[]}
            initialValue={user.email}
          />
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
                <Button onClick={handleInitiateVerification}>
                  {t('AccountForm.Resend')}
                </Button>
              )}
            </p>
          )}
          <FinalFormField
            name="username"
            id="username"
            type="text"
            autoComplete="username"
            label={t('AccountForm.UserName')}
            ariaLabel={t('AccountForm.UserNameARIA')}
            validate={validateUsername}
            validateFields={[]}
            initialValue={user.username}
          />
          <FinalFormField
            name="currentPassword"
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            label={t('AccountForm.CurrentPassword')}
            ariaLabel={t('AccountForm.CurrentPasswordARIA')}
          />
          <FinalFormField
            name="newPassword"
            id="newPassword"
            type="password"
            autoComplete="new-password"
            label={t('AccountForm.NewPassword')}
            ariaLabel={t('AccountForm.NewPasswordARIA')}
          />
          <Button type="submit" disabled={submitting || invalid}>
            {t('AccountForm.SubmitSaveAllSettings')}
          </Button>
        </form>
      )}
    </Form>
  );
}

export default AccountForm;
