import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Form, Field } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import { browserHistory } from 'react-router';
import { validateSignup } from '../../../utils/reduxFormUtils';
import { signUpUser, authenticateUser, authError } from '../actions';
import Button from '../../../common/Button';
import { justOpenedProject } from '../../IDE/actions/ide';
import apiClient from '../../../utils/apiClient';

function asyncValidate(fieldToValidate, value) {
  if (!value || value.trim().length === 0) return `Please enter a ${fieldToValidate}.`;
  const queryParams = {};
  queryParams[fieldToValidate] = value;
  queryParams.check_type = fieldToValidate;
  return apiClient.get('/signup/duplicate_check', { params: queryParams })
    .then((response) => {
      if (response.data.exists) {
        return response.data.message;
      }
      return '';
    });
}

function validateUsername(username) {
  return asyncValidate('username', username);
}

function validateEmail(email) {
  return asyncValidate('email', email);
}

function SignupForm(props) {
  const dispatch = useDispatch();
  const previousPath = useSelector(state => state.ide.previousPath);
  function validateAndsignUpUser(formValues) {
    return new Promise((resolve, reject) => {
      signUpUser(formValues)
        .then((response) => {
          dispatch(authenticateUser(response.data));
          dispatch(justOpenedProject());
          browserHistory.push(previousPath);
          resolve();
        })
        .catch((error) => {
          const { response } = error;
          dispatch(authError(response.data.error));
          reject();
        });
    });
  }

  return (
    <Form
      fields={['username', 'email', 'password', 'confirmPassword']}
      validate={validateSignup}
      onSubmit={validateAndsignUpUser}
    >
      {({
        handleSubmit, pristine, submitting, invalid
      }) => (
        <form
          className="form"
          onSubmit={handleSubmit}
        >
          <Field name="username" validate={validateUsername} validateFields={[]}>
            {field => (
              <p className="form__field">
                <label htmlFor="username" className="form__label">{props.t('SignupForm.Title')}</label>
                <input
                  className="form__input"
                  aria-label={props.t('SignupForm.TitleARIA')}
                  type="text"
                  id="username"
                  {...field.input}
                />
                {field.meta.touched && field.meta.error && (
                  <span className="form-error">{field.meta.error}</span>
                )}
              </p>
            )}
          </Field>
          <Field name="email" validate={validateEmail} validateFields={[]}>
            {field => (
              <p className="form__field">
                <label htmlFor="email" className="form__label">{props.t('SignupForm.Email')}</label>
                <input
                  className="form__input"
                  aria-label={props.t('SignupForm.EmailARIA')}
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
                <label htmlFor="password" className="form__label">{props.t('SignupForm.Password')}</label>
                <input
                  className="form__input"
                  aria-label={props.t('SignupForm.PasswordARIA')}
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
          <Field name="confirmPassword">
            {field => (
              <p className="form__field">
                <label htmlFor="confirm password" className="form__label">{props.t('SignupForm.ConfirmPassword')}</label>
                <input
                  className="form__input"
                  type="password"
                  aria-label={props.t('SignupForm.ConfirmPasswordARIA')}
                  id="confirm password"
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
            disabled={submitting || invalid || pristine}
          >{props.t('SignupForm.SubmitSignup')}
          </Button>
        </form>

      )}
    </Form>
  );
}

SignupForm.propTypes = {
  t: PropTypes.func.isRequired
};

export default withTranslation()(SignupForm);
