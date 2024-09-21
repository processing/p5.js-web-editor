import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { validateSignup } from '../../../utils/reduxFormUtils';
import { validateAndSignUpUser } from '../actions';
import Button from '../../../common/Button';
import apiClient from '../../../utils/apiClient';

const DEBOUNCE_DELAY = 300; // milliseconds

function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

function asyncValidate(fieldToValidate, value) {
  if (!value || value.trim().length === 0) {
    return Promise.resolve('');
  }
  const queryParams = {
    [fieldToValidate]: value,
    check_type: fieldToValidate
  };
  return apiClient
    .get('/signup/duplicate_check', { params: queryParams })
    .then((response) => {
      if (response.data.exists) {
        return response.data.message;
      }
      return '';
    });
}

function SignupForm() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const debouncedValidateUsername = useDebounce((username, callback) => {
    asyncValidate('username', username).then(callback);
  }, DEBOUNCE_DELAY);

  const debouncedValidateEmail = useDebounce((email, callback) => {
    asyncValidate('email', email).then(callback);
  }, DEBOUNCE_DELAY);

  const validateUsername = useCallback((username) => {
    return new Promise((resolve) => {
      debouncedValidateUsername(username, resolve);
    });
  }, [debouncedValidateUsername]);

  const validateEmail = useCallback((email) => {
    return new Promise((resolve) => {
      debouncedValidateEmail(email, resolve);
    });
  }, [debouncedValidateEmail]);

  const onSubmit = useCallback((formProps) => {
    return dispatch(validateAndSignUpUser(formProps));
  }, [dispatch]);

  const handleVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleConfirmVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

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
                  {...field.input}
                />
                {field.meta.validating && <span>Validating...</span>}
                {field.meta.touched && field.meta.error && (
                  <span className="form-error" aria-live="polite">
                    {field.meta.error}
                  </span>
                )}
              </div>
            )}
          </Field>
          <Field name="email" validate={validateEmail} validateFields={[]}>
            {(field) => (
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
                  {...field.input}
                />
                {field.meta.validating && <span>Validating...</span>}
                {field.meta.touched && field.meta.error && (
                  <span className="form-error" aria-live="polite">
                    {field.meta.error}
                  </span>
                )}
              </div>
            )}
          </Field>
          {/* Rest of the form fields remain unchanged */}
          {/* ... */}
          <Button type="submit" disabled={submitting || invalid || pristine}>
            {t('SignupForm.SubmitSignup')}
          </Button>
        </form>
      )}
    </Form>
  );
}

export default SignupForm;
