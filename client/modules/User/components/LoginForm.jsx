import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import Button from '../../../common/Button';

import { domOnlyProps } from '../../../utils/reduxFormUtils';

function LoginForm(props) {
  const {
    fields: { email, password }, handleSubmit, submitting, pristine
  } = props;
  return (
    <form className="form" onSubmit={handleSubmit(props.validateAndLoginUser.bind(this, props.previousPath))}>
      <p className="form__field">
        <label htmlFor="email" className="form__label">{props.t('LoginForm.UsernameOrEmail')}</label>
        <input
          className="form__input"
          aria-label={props.t('LoginForm.UsernameOrEmailARIA')}
          type="text"
          id="email"
          {...domOnlyProps(email)}
        />
        {email.touched && email.error && <span className="form-error">{email.error}</span>}
      </p>
      <p className="form__field">
        <label htmlFor="password" className="form__label">{props.t('LoginForm.Password')}</label>
        <input
          className="form__input"
          aria-label={props.t('LoginForm.PasswordARIA')}
          type="password"
          id="password"
          {...domOnlyProps(password)}
        />
        {password.touched && password.error && <span className="form-error">{password.error}</span>}
      </p>
      <Button
        type="submit"
        disabled={submitting || pristine}
      >{props.t('LoginForm.Submit')}
      </Button>
    </form>
  );
}

LoginForm.propTypes = {
  fields: PropTypes.shape({
    email: PropTypes.object.isRequired,
    password: PropTypes.object.isRequired
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  validateAndLoginUser: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  pristine: PropTypes.bool,
  invalid: PropTypes.bool,
  previousPath: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
};

LoginForm.defaultProps = {
  submitting: false,
  pristine: true,
  invalid: false
};

export default withTranslation()(LoginForm);
