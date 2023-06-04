import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import FinalFormField from '../../../common/FinalFormField';
import { validateSignup } from '../../../utils/reduxFormUtils';
import { validateAndSignUpUser } from '../actions';
import Button from '../../../common/Button';
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

function validateUsername(username) {
  return asyncValidate('username', username);
}

function validateEmail(email) {
  return asyncValidate('email', email);
}

function SignupForm() {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  function onSubmit(formProps) {
    return dispatch(validateAndSignUpUser(formProps));
  }

  return (
    <Form
      fields={['username', 'email', 'password', 'confirmPassword']}
      validate={validateSignup}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, pristine, submitting, invalid }) => (
        <form className="form" onSubmit={handleSubmit}>
          <FinalFormField
            name="username"
            id="username"
            type="text"
            autoComplete="username"
            label={t('SignupForm.Title')}
            ariaLabel={t('SignupForm.TitleARIA')}
            validate={validateUsername}
            validateFields={[]}
          />
          <FinalFormField
            name="email"
            id="email"
            type="email"
            autoComplete="email"
            label={t('SignupForm.Email')}
            ariaLabel={t('SignupForm.EmailARIA')}
            validate={validateEmail}
            validateFields={[]}
          />
          <FinalFormField
            name="password"
            id="password"
            type="password"
            autoComplete="new-password"
            label={t('SignupForm.Password')}
            ariaLabel={t('SignupForm.PasswordARIA')}
          />
          <FinalFormField
            name="confirmPassword"
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            label={t('SignupForm.ConfirmPassword')}
            ariaLabel={t('SignupForm.ConfirmPasswordARIA')}
          />
          <Button type="submit" disabled={submitting || invalid || pristine}>
            {t('SignupForm.SubmitSignup')}
          </Button>
        </form>
      )}
    </Form>
  );
}

export default SignupForm;
