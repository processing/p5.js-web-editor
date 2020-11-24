import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { domOnlyProps } from '../../../utils/reduxFormUtils';
import Button from '../../../common/Button';

function SignupForm(props) {
  const {
    fields: {
      username, email, password, confirmPassword
    },
    handleSubmit,
    submitting,
    invalid,
    pristine,
  } = props;
  return (
    <form
      className="form"
      onSubmit={handleSubmit(props.signUpUser.bind(this, props.previousPath))}
    >
      <p className="form__field">
        <label htmlFor="username" className="form__label">{props.t('SignupForm.Title')}</label>
        <input
          className="form__input"
          aria-label={props.t('SignupForm.TitleARIA')}
          type="text"
          id="username"
          {...domOnlyProps(username)}
        />
        {username.touched && username.error && (
          <span className="form-error">{username.error}</span>
        )}
      </p>
      <p className="form__field">
        <label htmlFor="email" className="form__label">{props.t('SignupForm.Email')}</label>
        <input
          className="form__input"
          aria-label={props.t('SignupForm.EmailARIA')}
          type="text"
          id="email"
          {...domOnlyProps(email)}
        />
        {email.touched && email.error && (
          <span className="form-error">{email.error}</span>
        )}
      </p>
      <p className="form__field">
        <label htmlFor="password" className="form__label">{props.t('SignupForm.Password')}</label>
        <input
          className="form__input"
          aria-label={props.t('SignupForm.PasswordARIA')}
          type="password"
          id="password"
          {...domOnlyProps(password)}
        />
        {password.touched && password.error && (
          <span className="form-error">{password.error}</span>
        )}
      </p>
      <p className="form__field">
        <label htmlFor="confirm password" className="form__label">{props.t('SignupForm.ConfirmPassword')}</label>
        <input
          className="form__input"
          type="password"
          aria-label={props.t('SignupForm.ConfirmPasswordARIA')}
          id="confirm password"
          {...domOnlyProps(confirmPassword)}
        />
        {confirmPassword.touched && confirmPassword.error && (
          <span className="form-error">{confirmPassword.error}</span>
        )}
      </p>
      <Button
        type="submit"
        disabled={submitting || invalid || pristine}
      >{props.t('SignupForm.SubmitSignup')}
      </Button>
    </form>
  );
}

SignupForm.propTypes = {
  fields: PropTypes.shape({
    username: PropTypes.objectOf(PropTypes.shape()),
    email: PropTypes.objectOf(PropTypes.shape()),
    password: PropTypes.objectOf(PropTypes.shape()),
    confirmPassword: PropTypes.objectOf(PropTypes.shape()),
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  signUpUser: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  invalid: PropTypes.bool,
  pristine: PropTypes.bool,
  previousPath: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
};

SignupForm.defaultProps = {
  submitting: false,
  pristine: true,
  invalid: false,
};

export default withTranslation()(SignupForm);
