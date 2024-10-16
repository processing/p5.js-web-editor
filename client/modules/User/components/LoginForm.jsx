import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Button from '../../../common/Button';
import { validateLogin } from '../../../utils/reduxFormUtils';
import { validateAndLoginUser } from '../actions';

function LoginForm() {
  const { t, i18n } = useTranslation();

  const dispatch = useDispatch();
  function onSubmit(formProps) {
    return dispatch(validateAndLoginUser(formProps));
  }
  const [showPassword, setShowPassword] = useState(false);
  const [formUpdateKey, setFormUpdateKey] = useState(false);

  const handleVisibility = () => {
    setShowPassword(!showPassword);
  };
  useEffect(() => {
    setFormUpdateKey(!formUpdateKey);
  }, [i18n.language]);

  return (
    <Form
      fields={['email', 'password']}
      validate={validateLogin}
      onSubmit={onSubmit}
      key={formUpdateKey}
    >
      {({ handleSubmit, submitError, submitting, modifiedSinceLastSubmit }) => (
        <form className="form" onSubmit={handleSubmit}>
          <Field name="email">
            {(field) => (
              <div className="form__field">
                <label htmlFor="email" className="form__label">
                  {t('LoginForm.UsernameOrEmail')}
                </label>
                <input
                  className="form__input"
                  aria-label={t('LoginForm.UsernameOrEmailARIA')}
                  type="text"
                  id="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  {...field.input}
                />
                {field.meta.touched && field.meta.error && (
                  <span className="form-error" aria-live="polite">
                    {field.meta.error}
                  </span>
                )}
              </div>
            )}
          </Field>
          <Field name="password">
            {(field) => (
              <div className="form__field">
                <label htmlFor="password" className="form__label">
                  {t('LoginForm.Password')}
                </label>
                <div className="form__field__password">
                  <input
                    className="form__input"
                    aria-label={t('LoginForm.PasswordARIA')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    {...field.input}
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
                {field.meta.touched && field.meta.error && (
                  <span className="form-error" aria-live="polite">
                    {field.meta.error}
                  </span>
                )}
              </div>
            )}
          </Field>
          {submitError && !modifiedSinceLastSubmit && (
            <span className="form-error">{submitError}</span>
          )}
          <Button type="submit" disabled={submitting}>
            {t('LoginForm.Submit')}
          </Button>
        </form>
      )}
    </Form>
  );
}

export default LoginForm;
