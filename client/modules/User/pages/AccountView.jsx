import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import InlineSVG from 'react-inlinesvg';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { updateSettings, initiateVerification } from '../actions';
import AccountForm from '../components/AccountForm';
import { validateSettings } from '../../../utils/reduxFormUtils';
import GithubButton from '../components/GithubButton';

const exitUrl = require('../../../images/exit.svg');
const logoUrl = require('../../../images/p5js-logo.svg');


class AccountView extends React.Component {
  constructor(props) {
    super(props);
    this.closeAccountPage = this.closeAccountPage.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);
  }

  closeAccountPage() {
    browserHistory.push(this.props.previousPath);
  }

  gotoHomePage() {
    browserHistory.push('/');
  }

  render() {
    return (
      <div className="form-container">
        <Helmet>
          <title>p5.js Web Editor | Account</title>
        </Helmet>
        <div className="form-container__header">
          <button className="form-container__logo-button" onClick={this.gotoHomePage}>
            <InlineSVG src={logoUrl} alt="p5js Logo" />
          </button>
          <button className="form-container__exit-button" onClick={this.closeAccountPage}>
            <InlineSVG src={exitUrl} alt="Close Account Page" />
          </button>
        </div>
        <div className="form-container__content">
          <h2 className="form-container__title">My Account</h2>
          <AccountForm {...this.props} />
          <h2 className="form-container__divider">Or</h2>
          <GithubButton buttonText="Login with Github" />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    initialValues: state.user, // <- initialValues for reduxForm
    user: state.user,
    previousPath: state.ide.previousPath
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateSettings, initiateVerification }, dispatch);
}

function asyncValidate(formProps, dispatch, props) {
  const fieldToValidate = props.form._active;
  if (fieldToValidate) {
    const queryParams = {};
    queryParams[fieldToValidate] = formProps[fieldToValidate];
    queryParams.check_type = fieldToValidate;
    return axios.get('/api/signup/duplicate_check', { params: queryParams })
      .then((response) => {
        if (response.data.exists) {
          const error = {};
          error[fieldToValidate] = response.data.message;
          throw error;
        }
      });
  }
  return Promise.resolve(true).then(() => {});
}

AccountView.propTypes = {
  previousPath: PropTypes.string.isRequired,
};

export default reduxForm({
  form: 'updateAllSettings',
  fields: ['username', 'email', 'currentPassword', 'newPassword'],
  validate: validateSettings,
  asyncValidate,
  asyncBlurFields: ['username', 'email', 'currentPassword']
}, mapStateToProps, mapDispatchToProps)(AccountView);
