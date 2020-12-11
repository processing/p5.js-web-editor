import PropTypes from 'prop-types';
import React from 'react';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { validateNewPassword } from '../../../utils/reduxFormUtils';
import { updatePassword } from '../actions';
import Button from '../../../common/Button';

function NewPasswordForm(props) {
  const { resetPasswordToken } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  function onSubmit(formProps) {
    return dispatch(updatePassword(formProps, resetPasswordToken));
  }

  return (
    <Form
      fields={['password', 'confirmPassword']}
      validate={validateNewPassword}
      onSubmit={onSubmit}
    >
      {({
        handleSubmit, submitting, invalid, pristine
      }) => (
        <form
          className="form"
          onSubmit={handleSubmit}
        >
          <Field name="password">
            {field => (
              <p className="form__field">
                <label htmlFor="password" className="form__label">{t('NewPasswordForm.Title')}</label>
                <input
                  className="form__input"
                  aria-label={t('NewPasswordForm.TitleARIA')}
                  type="password"
                  id="Password"
                  {...field.input}
                />
                {field.meta.touched && field.meta.error && (
                  <span className="form-error">{field.meta.error}</span>
                )}
              </p>
            )}
          </Field>
          <Field name="confirmPassword">
            {field => (
              <p className="form__field">
                <label htmlFor="confirm password" className="form__label">{t('NewPasswordForm.ConfirmPassword')}</label>
                <input
                  className="form__input"
                  type="password"
                  aria-label={t('NewPasswordForm.ConfirmPasswordARIA')}
                  id="confirm password"
                  {...field.input}
                />
                {field.meta.touched && field.meta.error && (
                  <span className="form-error">{field.meta.error}</span>
                )}
              </p>
            )}
          </Field>
          <Button type="submit" disabled={submitting || invalid || pristine}>{t('NewPasswordForm.SubmitSetNewPassword')}</Button>
        </form>
      )}
    </Form>
  );
}

NewPasswordForm.propTypes = {
  resetPasswordToken: PropTypes.string.isRequired,
};

export default NewPasswordForm;
