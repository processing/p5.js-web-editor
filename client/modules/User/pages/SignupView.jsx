import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import axios from 'axios';
import { Link, browserHistory } from 'react-router';
import { Helmet } from 'react-helmet';
import { reduxForm } from 'redux-form';
import * as UserActions from '../actions';
import SignupForm from '../components/SignupForm';
import { validateSignup } from '../../../utils/reduxFormUtils';
import Nav from '../../../components/Nav';

const __process = (typeof global !== 'undefined' ? global : window).process;
const ROOT_URL = __process.env.API_URL;

class SignupView extends React.Component {
  gotoHomePage = () => {
    browserHistory.push('/');
  }

  render() {
    if (this.props.user.authenticated) {
      this.gotoHomePage();
      return null;
    }
    return (
      <div className="signup">
        <Nav layout="dashboard" />
        <div className="form-container">
          <Helmet>
            <title>p5.js Web Editor | Signup</title>
          </Helmet>
          <div className="form-container__content">
            <h2 className="form-container__title">Sign Up</h2>
            <SignupForm {...this.props} />
            <p className="form__navigation-options">
              Already have an account?&nbsp;
              <Link className="form__login-button" to="/login">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

function asyncErrorsSelector(formName, state) {
  const form = state.form[formName];
  if (!form) {
    return {};
  }

  const fieldNames = Object.keys(form).filter(key => !key.startsWith('_'));
  return fieldNames.reduce((asyncErrors, fieldName) => {
    if (form[fieldName].asyncError) {
      return { ...asyncErrors, [fieldName]: form[fieldName].asyncError };
    }
    return asyncErrors;
  }, {});
}

function mapStateToProps(state) {
  return {
    user: state.user,
    previousPath: state.ide.previousPath,
    asyncErrors: asyncErrorsSelector('signup', state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(UserActions, dispatch);
}

function asyncValidate(formProps, dispatch, props) {
  const errors = {};
  return Promise.resolve(true)
    .then(() => {
      const fieldToValidate = props.form._active;
      if (fieldToValidate) {
        const queryParams = {};
        queryParams[fieldToValidate] = formProps[fieldToValidate];
        queryParams.check_type = fieldToValidate;
        return axios.get(`${ROOT_URL}/signup/duplicate_check`, { params: queryParams })
          .then((response) => {
            if (response.data.exists) {
              errors[fieldToValidate] = response.data.message;
            }
          });
      }
      return null;
    })
    .then(() => {
      const err = { ...errors, ...props.asyncErrors };
      if (Object.keys(err).length > 0) {
        throw err;
      }
    });
}

function onSubmitFail(errors) {
  console.log(errors);
}

SignupView.propTypes = {
  previousPath: PropTypes.string.isRequired,
  user: PropTypes.shape({
    authenticated: PropTypes.bool
  })
};

SignupView.defaultProps = {
  user: {
    authenticated: false
  }
};

export default reduxForm({
  form: 'signup',
  fields: ['username', 'email', 'password', 'confirmPassword'],
  onSubmitFail,
  validate: validateSignup,
  asyncValidate,
  asyncBlurFields: ['username', 'email']
}, mapStateToProps, mapDispatchToProps)(SignupView);
