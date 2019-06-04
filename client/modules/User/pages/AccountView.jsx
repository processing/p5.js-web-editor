import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import InlineSVG from 'react-inlinesvg';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { updateSettings, initiateVerification, createApiKey, removeApiKey } from '../actions';
import AccountForm from '../components/AccountForm';
import { validateSettings } from '../../../utils/reduxFormUtils';
import GithubButton from '../components/GithubButton';
import APIKeyForm from '../components/APIKeyForm';
import NavBasic from '../../../components/NavBasic';

const exitUrl = require('../../../images/exit.svg');

class AccountView extends React.Component {
  constructor(props) {
    super(props);
    this.closeAccountPage = this.closeAccountPage.bind(this);
    this.gotoHomePage = this.gotoHomePage.bind(this);
  }

  componentDidMount() {
    document.body.className = this.props.theme;
  }

  closeAccountPage() {
    browserHistory.push(this.props.previousPath);
  }

  gotoHomePage() {
    browserHistory.push('/');
  }

  render() {
    return (
      <div className="user">
        <Helmet>
          <title>p5.js Web Editor | Account</title>
        </Helmet>

        <NavBasic />

        <section className="modal">
          <div className="modal-content">
            <div className="modal__header">
              <h2 className="modal__title">My Account</h2>
              <button className="modal__exit-button" onClick={this.closeAccountPage}>
                <InlineSVG src={exitUrl} alt="Close Account Page" />
              </button>
            </div>
            <Tabs className="account__tabs">
              <TabList>
                <div className="tabs__titles">
                  <Tab><h4 className="tabs__title">Account</h4></Tab>
                  <Tab><h4 className="tabs__title">Access Tokens</h4></Tab>
                </div>
              </TabList>
              <TabPanel>
                <AccountForm {...this.props} />
                <h2 className="form-container__divider">Social Login</h2>
                <p className="account__social-text">
                  Link this account with your GitHub account to allow login from both.
                </p>
                <GithubButton buttonText="Login with GitHub" />
              </TabPanel>
              <TabPanel>
                <APIKeyForm {...this.props} />
              </TabPanel>
            </Tabs>
          </div>
        </section>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    initialValues: state.user, // <- initialValues for reduxForm
    previousPath: state.ide.previousPath,
    user: state.user,
    apiKeys: state.user.apiKeys,
    theme: state.preferences.theme
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    updateSettings, initiateVerification, createApiKey, removeApiKey
  }, dispatch);
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
  theme: PropTypes.string.isRequired
};

export default reduxForm({
  form: 'updateAllSettings',
  fields: ['username', 'email', 'currentPassword', 'newPassword'],
  validate: validateSettings,
  asyncValidate,
  asyncBlurFields: ['username', 'email', 'currentPassword']
}, mapStateToProps, mapDispatchToProps)(AccountView);
