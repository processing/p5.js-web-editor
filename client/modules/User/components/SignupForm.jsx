import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { validateSignup } from '../../../utils/reduxFormUtils';
import { validateAndSignUpUser } from '../actions';
import Button from '../../../common/Button';
import apiClient from '../../../utils/apiClient';
import eyeClose from '../../../images/eye-close.png';
import eyeOpen from '../../../images/eye-open.png';

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
  const [showPassword, setShowPassword] = useState(false);
  const handleShow = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Form
      fields={['username', 'email', 'password', 'confirmPassword']}
      validate={validateSignup}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, pristine, submitting, invalid }) => (
        <form className="form" onSubmit={handleSubmit}>
          <Field
            name="username"
            validate={validateUsername}
            validateFields={[]}
          >
            {(field) => (
              <p className="form__field">
                <label htmlFor="username" className="form__label">
                  {t('SignupForm.Title')}
                </label>
                <input
                  className="form__input"
                  aria-label={t('SignupForm.TitleARIA')}
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
          <Field name="email" validate={validateEmail} validateFields={[]}>
            {(field) => (
              <p className="form__field">
                <label htmlFor="email" className="form__label">
                  {t('SignupForm.Email')}
                </label>
                <input
                  className="form__input"
                  aria-label={t('SignupForm.EmailARIA')}
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
          <Field name="password">
            {(field) => (
              <div style={{ position: 'relative' }}>
                <p className="form__field">
                  <label htmlFor="password" className="form__label">
                    {t('SignupForm.Password')}
                  </label>
                  <div className="password_form">
                    <input
                      className="form__input"
                      aria-label={t('SignupForm.PasswordARIA')}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="new-password"
                      {...field.input}
                    />
                    <button
                      type="button"
                      className="eye_button"
                      onClick={handleShow}
                      style={{
                        fontSize: '25px',
                        position: 'absolute',
                        top: '38%',
                        right: '2px',
                        paddingTop: '4.5px'
                      }}
                    >
                      <img
                        src={showPassword ? eyeClose : eyeOpen}
                        alt="eye-logo"
                      />
                    </button>
                  </div>
                  {field.meta.touched && field.meta.error && (
                    <span className="form-error">{field.meta.error}</span>
                  )}
                </p>
              </div>
            )}
          </Field>
          <Field name="confirmPassword">
            {(field) => (
              <p className="form__field">
                <label htmlFor="confirm password" className="form__label">
                  {t('SignupForm.ConfirmPassword')}
                </label>
                <input
                  className="form__input"
                  type="password"
                  aria-label={t('SignupForm.ConfirmPasswordARIA')}
                  id="confirm password"
                  autoComplete="new-password"
                  {...field.input}
                />
                {field.meta.touched && field.meta.error && (
                  <span className="form-error">{field.meta.error}</span>
                )}
              </p>
            )}
          </Field>
          <Button type="submit" disabled={submitting || invalid || pristine}>
            {t('SignupForm.SubmitSignup')}
          </Button>
        </form>
      )}
    </Form>
  );
}

export default SignupForm;
