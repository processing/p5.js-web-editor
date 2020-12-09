import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Field } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import { validateResetPassword } from '../../../utils/reduxFormUtils';
import { initiateResetPassword } from '../actions';
import Button from '../../../common/Button';

function ResetPasswordForm(props) {
  const { t } = useTranslation();
  const resetPasswordInitiate = useSelector(state => state.user.resetPasswordInitiate);
  const dispatch = useDispatch();

  function submitInitiateResetPassword() {
    dispatch(initiateResetPassword());
  }

  return (
    <Form
      fields={['email']}
      validate={validateResetPassword}
      onSubmit={submitInitiateResetPassword}
    >
      {({
        handleSubmit, submitting, pristine, invalid
      }) => (
        <form
          className="form"
          onSubmit={handleSubmit}
        >
          <Field name="email">
            {field => (
              <p className="form__field">
                <label htmlFor="email" className="form__label">{t('ResetPasswordForm.Email')}</label>
                <input
                  className="form__input"
                  aria-label={t('ResetPasswordForm.EmailARIA')}
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
          <Button
            type="submit"
            disabled={submitting || invalid || pristine || resetPasswordInitiate}
          >{t('ResetPasswordForm.Submit')}
          </Button>
        </form>
      )}
    </Form>
  );
}

export default ResetPasswordForm;
