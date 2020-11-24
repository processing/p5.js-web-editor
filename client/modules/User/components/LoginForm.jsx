import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Form, Field } from 'react-final-form';
import { browserHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../common/Button';
import { validateLogin } from '../../../utils/reduxFormUtils';
import { loginUser, loginUserSuccess, setPreferences } from '../actions';
import { setLanguage } from '../../IDE/actions/preferences';
import { justOpenedProject } from '../../IDE/actions/ide';

function LoginForm(props) {
  const dispatch = useDispatch();
  const previousPath = useSelector(state => state.ide.previousPath);
  function validateAndLoginUser(formProps) {
    return new Promise((resolve, reject) => {
      loginUser(formProps)
        .then((response) => {
          dispatch(loginUserSuccess(response.data));
          dispatch(setPreferences(response.data.preferences));
          dispatch(setLanguage(response.data.preferences.language, { persistPreference: false }));
          dispatch(justOpenedProject());
          browserHistory.push(previousPath);
          resolve();
        })
        .catch(error =>
          reject({ password: error.response.data.message, _error: 'Login failed!' })); // eslint-disable-line
    });
  }

  return (
    <Form
      fields={['email', 'password']}
      validate={validateLogin}
      onSubmit={validateAndLoginUser}
    >
      {({
        handleSubmit, pristine, submitting
      }) => (
        <form
          className="form"
          onSubmit={handleSubmit}
        >
          <Field name="email">
            {field => (
              <p className="form__field">
                <label htmlFor="email" className="form__label">{props.t('LoginForm.UsernameOrEmail')}</label>
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
            {field => (
              <p className="form__field">
                <label htmlFor="password" className="form__label">{props.t('LoginForm.Password')}</label>
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
          <Button
            type="submit"
            disabled={submitting || pristine}
          >{props.t('LoginForm.Submit')}
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
