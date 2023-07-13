import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import Button from '../../../common/Button';
import { validateLogin } from '../../../utils/reduxFormUtils';
import { validateAndLoginUser } from '../actions';

function LoginForm() {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  function onSubmit(formProps) {
    return dispatch(validateAndLoginUser(formProps));
  }

  return (
    <Form
      fields={['email', 'password']}
      validate={validateLogin}
      onSubmit={onSubmit}
    >
      {({
        handleSubmit,
        submitError,
        pristine,
        submitting,
        modifiedSinceLastSubmit
      }) => (
        <form className="form" onSubmit={handleSubmit}>
          <Field name="email">
            {(field) => (
              <p className="form__field">
                <label htmlFor="email" className="form__label">
                  {t('LoginForm.UsernameOrEmail')}
                </label>
                <input
                  className="form__input"
                  aria-label={t('LoginForm.UsernameOrEmailARIA')}
                  type="text"
                  id="email"
                  autoComplete="username"
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
              <p className="form__field">
                <label htmlFor="password" className="form__label">
                  {t('LoginForm.Password')}
                </label>
                <input
                  className="form__input"
                  aria-label={t('LoginForm.PasswordARIA')}
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  {...field.input}
                />
                {field.meta.touched && field.meta.error && (
                  <span className="form-error">{field.meta.error}</span>
                )}
              </p>
            )}
          </Field>
          {submitError && !modifiedSinceLastSubmit && (
            <span className="form-error">{submitError}</span>
          )}
          <Button type="submit" disabled={submitting || pristine}>
            {t('LoginForm.Submit')}
          </Button>
        </form>
      )}
    </Form>
  );
}

export default LoginForm;
