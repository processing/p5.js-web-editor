import PropTypes from 'prop-types';
import React from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import FinalFormField from '../../../common/FinalFormField';
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
      {({ handleSubmit, submitting, invalid, pristine }) => (
        <form className="form" onSubmit={handleSubmit}>
          <FinalFormField
            name="password"
            id="Password"
            type="password"
            autoComplete="new-password"
            label={t('NewPasswordForm.Title')}
            ariaLabel={t('NewPasswordForm.TitleARIA')}
          />
          <FinalFormField
            name="confirmPassword"
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            label={t('NewPasswordForm.ConfirmPassword')}
            ariaLabel={t('NewPasswordForm.ConfirmPasswordARIA')}
          />
          <Button type="submit" disabled={submitting || invalid || pristine}>
            {t('NewPasswordForm.SubmitSetNewPassword')}
          </Button>
        </form>
      )}
    </Form>
  );
}

NewPasswordForm.propTypes = {
  resetPasswordToken: PropTypes.string.isRequired
};

export default NewPasswordForm;
