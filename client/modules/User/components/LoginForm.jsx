import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import Button from '../../../common/Button';
import { validateLogin } from '../../../utils/reduxFormUtils';
import { validateAndLoginUser } from '../actions';

function LoginForm(props) {
  const dispatch = useDispatch();
  function onSubmit(formProps) {
    return dispatch(validateAndLoginUser(formProps));
  }

  return (
    <Form
      fields={['email', 'password', 'remember']}
      validate={validateLogin}
      onSubmit={onSubmit}
    >
      {({ handleSubmit, pristine, submitting, invalid }) => (
        <form className="form" onSubmit={handleSubmit}>
          <Field name="email">
            {(field) => (
              <p className="form__field">
                <label htmlFor="email" className="form__label">
                  {props.t('LoginForm.UsernameOrEmail')}
                </label>
                <input
                  className="form__input"
                  aria-label={props.t('LoginForm.UsernameOrEmailARIA')}
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
          <Field name="password">
            {(field) => (
              <p className="form__field">
                <label htmlFor="password" className="form__label">
                  {props.t('LoginForm.Password')}
                </label>
                <input
                  className="form__input"
                  aria-label={props.t('LoginForm.PasswordARIA')}
                  type="password"
                  id="password"
                  {...field.input}
                />
                {field.meta.touched && field.meta.error && (
                  <span className="form-error">{field.meta.error}</span>
                )}
              </p>
            )}
          </Field>
          <Field name="remember">
            {field => (
              <div className="form__field">
                <p style={{ display: 'inline-block' }}>Remember me</p>
                <input
                  type="checkbox"
                  id="remember-me"
                  {...field.input}
                />
              </div>
            )}
          </Field>
          <Button type="submit" disabled={submitting || invalid || pristine}>
            {props.t('LoginForm.Submit')}
          </Button>
        </form>
      )}
    </Form>
  );
}

LoginForm.propTypes = {
  t: PropTypes.func.isRequired
};

export default withTranslation()(LoginForm);
