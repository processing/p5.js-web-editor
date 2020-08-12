import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { Helmet } from 'react-helmet';
import { withTranslation } from 'react-i18next';
import i18next from 'i18next';
import NewPasswordForm from '../components/NewPasswordForm';
import * as UserActions from '../actions';
import Nav from '../../../components/Nav';

function NewPasswordView(props) {
  const newPasswordClass = classNames({
    'new-password': true,
    'new-password--invalid': props.user.resetPasswordInvalid,
    'form-container': true,
    'user': true
  });
  return (
    <div className="new-password-container">
      <Nav layout="dashboard" />
      <div className={newPasswordClass}>
        <Helmet>
          <title>{props.t('NewPasswordView.Title')}</title>
        </Helmet>
        <div className="form-container__content">
          <h2 className="form-container__title">{props.t('NewPasswordView.Description')}</h2>
          <NewPasswordForm {...props} />
          <p className="new-password__invalid">
            {props.t('NewPasswordView.TokenInvalidOrExpired')}
          </p>
        </div>
      </div>
    </div>
  );
}

NewPasswordView.propTypes = {
  params: PropTypes.shape({
    reset_password_token: PropTypes.string,
  }).isRequired,
  validateResetPasswordToken: PropTypes.func.isRequired,
  user: PropTypes.shape({
    resetPasswordInvalid: PropTypes.bool
  }).isRequired,
  t: PropTypes.func.isRequired
};

function validate(formProps) {
  const errors = {};

  if (!formProps.password) {
    errors.password = i18next.t('NewPasswordView.EmptyPassword');
  }
  if (!formProps.confirmPassword) {
    errors.confirmPassword = i18next.t('NewPasswordView.PasswordConfirmation');
  }

  if (formProps.password !== formProps.confirmPassword) {
    errors.password = i18next.t('NewPasswordView.PasswordMismatch');
  }

  return errors;
}

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(UserActions, dispatch);
}

export default withTranslation()(reduxForm({
  form: 'new-password',
  fields: ['password', 'confirmPassword'],
  validate
}, mapStateToProps, mapDispatchToProps)(NewPasswordView));
