import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import Button from '../../../common/Button';
import FinalFormField from '../../../common/FinalFormField';
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
          <FinalFormField
            name="email"
            id="email"
            type="text"
            autoComplete="username"
            label={t('LoginForm.UsernameOrEmail')}
            ariaLabel={t('LoginForm.UsernameOrEmailARIA')}
          />
          <FinalFormField
            name="password"
            id="password"
            type="password"
            autoComplete="current-password"
            label={t('LoginForm.Password')}
            ariaLabel={t('LoginForm.PasswordARIA')}
          />
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
