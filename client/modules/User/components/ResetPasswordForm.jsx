import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import FinalFormField from '../../../common/FinalFormField';
import { validateResetPassword } from '../../../utils/reduxFormUtils';
import { initiateResetPassword } from '../actions';
import Button from '../../../common/Button';

function ResetPasswordForm() {
  const { t } = useTranslation();
  const resetPasswordInitiate = useSelector(
    (state) => state.user.resetPasswordInitiate
  );
  const dispatch = useDispatch();

  function onSubmit(formProps) {
    dispatch(initiateResetPassword(formProps));
  }

  return (
    <Form
      fields={['email']}
      validate={validateResetPassword}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, submitting, pristine, invalid }) => (
        <form className="form" onSubmit={handleSubmit}>
          <FinalFormField
            name="email"
            id="email"
            type="email"
            autoComplete="email"
            label={t('ResetPasswordForm.Email')}
            ariaLabel={t('ResetPasswordForm.EmailARIA')}
          />
          <Button
            type="submit"
            disabled={
              submitting || invalid || pristine || resetPasswordInitiate
            }
          >
            {t('ResetPasswordForm.Submit')}
          </Button>
        </form>
      )}
    </Form>
  );
}

export default ResetPasswordForm;
