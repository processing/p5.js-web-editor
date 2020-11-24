import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { domOnlyProps } from '../../../utils/reduxFormUtils';
import Button from '../../../common/Button';

function AccountForm(props) {
  const {
    fields: {
      username, email, currentPassword, newPassword
    },
    user,
    handleSubmit,
    initiateVerification,
    submitting,
    invalid,
    pristine,
    t
  } = props;

  const handleInitiateVerification = (evt) => {
    evt.preventDefault();
    initiateVerification();
  };

  return (
    <form className="form" onSubmit={handleSubmit(props.updateSettings)}>
      <p className="form__field">
        <label htmlFor="email" className="form__label">{t('AccountForm.Email')}</label>
        <input
          className="form__input"
          aria-label={t('AccountForm.EmailARIA')}
          type="text"
          id="email"
          {...domOnlyProps(email)}
        />
        {email.touched && email.error && (
          <span className="form-error">{email.error}</span>
        )}
      </p>
      {
        user.verified !== 'verified' &&
          (
            <p className="form__context">
              <span className="form__status">{t('AccountForm.Unconfirmed')}</span>
              {
                user.emailVerificationInitiate === true ?
                  (
                    <span className="form__status"> {t('AccountForm.EmailSent')}</span>
                  ) :
                  (
                    <Button
                      onClick={handleInitiateVerification}
                    >{t('AccountForm.Resend')}
                    </Button>
                  )
              }
            </p>
          )
      }
      <p className="form__field">
        <label htmlFor="username" className="form__label">{t('AccountForm.UserName')}</label>
        <input
          className="form__input"
          aria-label={t('AccountForm.UserNameARIA')}
          type="text"
          id="username"
          defaultValue={username}
          {...domOnlyProps(username)}
        />
        {username.touched && username.error && (
          <span className="form-error">{username.error}</span>
        )}
      </p>
      <p className="form__field">
        <label htmlFor="current password" className="form__label">{t('AccountForm.CurrentPassword')}</label>
        <input
          className="form__input"
          aria-label={t('AccountForm.CurrentPasswordARIA')}
          type="password"
          id="currentPassword"
          {...domOnlyProps(currentPassword)}
        />
        {currentPassword.touched && currentPassword.error && (
          <span className="form-error">{currentPassword.error}</span>
        )}
      </p>
      <p className="form__field">
        <label htmlFor="new password" className="form__label">{t('AccountForm.NewPassword')}</label>
        <input
          className="form__input"
          aria-label={t('AccountForm.NewPasswordARIA')}
          type="password"
          id="newPassword"
          {...domOnlyProps(newPassword)}
        />
        {newPassword.touched && newPassword.error && (
          <span className="form-error">{newPassword.error}</span>
        )}
      </p>
      <Button
        type="submit"
        disabled={submitting || invalid || pristine}
      >{t('AccountForm.SubmitSaveAllSettings')}
      </Button>
    </form>
  );
}

AccountForm.propTypes = {
  fields: PropTypes.shape({
    username: PropTypes.objectOf(PropTypes.shape()),
    email: PropTypes.objectOf(PropTypes.shape()),
    currentPassword: PropTypes.objectOf(PropTypes.shape()),
    newPassword: PropTypes.objectOf(PropTypes.shape()),
  }).isRequired,
  user: PropTypes.shape({
    verified: PropTypes.string.isRequired,
    emailVerificationInitiate: PropTypes.bool.isRequired,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  initiateVerification: PropTypes.func.isRequired,
  updateSettings: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  pristine: PropTypes.bool,
  t: PropTypes.func.isRequired
};

AccountForm.defaultProps = {
  submitting: false,
  pristine: true,
  invalid: false,
};

export default withTranslation()(AccountForm);
