import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { validateSignup } from '../../../utils/reduxFormUtils';
import { validateAndSignUpUser } from '../actions';
import Button from '../../../common/Button';
import apiClient from '../../../utils/apiClient';
import useSyncFormTranslations from '../../../common/useSyncFormTranslations';

const debounce = (func, delay) => {
  let timer;
  return (...args) =>
    new Promise((resolve) => {
      clearTimeout(timer);
      timer = setTimeout(() => resolve(func(...args)), delay);
    });
};

// API Validation Function
async function asyncValidate(fieldToValidate, value) {
  if (!value || value.trim().length === 0) {
    return '';
  }
  const queryParams = {
    [fieldToValidate]: value,
    check_type: fieldToValidate
  };

  try {
    const response = await apiClient.get('/signup/duplicate_check', {
      params: queryParams
    });
    return response.data.exists ? response.data.message : '';
  } catch (error) {
    return 'Error validating field.';
  }
}

const debouncedAsyncValidate = debounce(asyncValidate, 300);

function validateUsername(username) {
  return debouncedAsyncValidate('username', username);
}

function validateEmail(email) {
  return debouncedAsyncValidate('email', email);
}

function SignupForm() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const formRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useSyncFormTranslations(formRef, i18n.language);

  const handleVisibility = () => setShowPassword(!showPassword);
  const handleConfirmVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  function onSubmit(formProps) {
    return dispatch(validateAndSignUpUser(formProps));
  }

  return (
    <Form
      fields={['username', 'email', 'password', 'confirmPassword']}
      validate={validateSignup}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, pristine, submitting, invalid, form }) => {
        formRef.current = form;
        return (
          <form className="form" onSubmit={handleSubmit}>
            {/* Username Field */}
            <Field
              name="username"
              validate={validateUsername}
              validateFields={[]}
            >
              {({ input, meta }) => (
                <div className="form__field">
                  <label htmlFor="username" className="form__label">
                    {t('SignupForm.Title')}
                  </label>
                  <input
                    className="form__input"
                    aria-label={t('SignupForm.TitleARIA')}
                    type="text"
                    id="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    {...input}
                  />
                  {meta.touched && meta.error && (
                    <span className="form-error" aria-live="polite">
                      {meta.error}
                    </span>
                  )}
                </div>
              )}
            </Field>

            {/* Email Field */}
            <Field name="email" validate={validateEmail} validateFields={[]}>
              {({ input, meta }) => (
                <div className="form__field">
                  <label htmlFor="email" className="form__label">
                    {t('SignupForm.Email')}
                  </label>
                  <input
                    className="form__input"
                    aria-label={t('SignupForm.EmailARIA')}
                    type="email"
                    id="email"
                    autoComplete="email"
                    {...input}
                  />
                  {meta.touched && meta.error && (
                    <span className="form-error" aria-live="polite">
                      {meta.error}
                    </span>
                  )}
                </div>
              )}
            </Field>

            {/* Password Field */}
            <Field name="password">
              {({ input, meta }) => (
                <div className="form__field">
                  <label htmlFor="password" className="form__label">
                    {t('SignupForm.Password')}
                  </label>
                  <div className="form__field__password">
                    <input
                      className="form__input"
                      aria-label={t('SignupForm.PasswordARIA')}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="new-password"
                      {...input}
                    />
                    <button
                      className="form__eye__icon"
                      type="button"
                      onClick={handleVisibility}
                      aria-hidden="true"
                    >
                      {showPassword ? (
                        <AiOutlineEyeInvisible />
                      ) : (
                        <AiOutlineEye />
                      )}
                    </button>
                  </div>
                  {meta.touched && meta.error && (
                    <span className="form-error" aria-live="polite">
                      {meta.error}
                    </span>
                  )}
                </div>
              )}
            </Field>

            {/* Confirm Password Field */}
            <Field name="confirmPassword">
              {({ input, meta }) => (
                <div className="form__field">
                  <label htmlFor="confirmPassword" className="form__label">
                    {t('SignupForm.ConfirmPassword')}
                  </label>
                  <div className="form__field__password">
                    <input
                      className="form__input"
                      aria-label={t('SignupForm.ConfirmPasswordARIA')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      {...input}
                    />
                    <button
                      className="form__eye__icon"
                      type="button"
                      onClick={handleConfirmVisibility}
                      aria-hidden="true"
                    >
                      {showConfirmPassword ? (
                        <AiOutlineEyeInvisible />
                      ) : (
                        <AiOutlineEye />
                      )}
                    </button>
                  </div>
                  {meta.touched && meta.error && (
                    <span className="form-error" aria-live="polite">
                      {meta.error}
                    </span>
                  )}
                </div>
              )}
            </Field>

            {/* Submit Button */}
            <Button type="submit" disabled={submitting || invalid || pristine}>
              {t('SignupForm.SubmitSignup')}
            </Button>
          </form>
        );
      }}
    </Form>
  );
}

export default SignupForm;
