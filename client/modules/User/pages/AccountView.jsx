import PropTypes from 'prop-types';
import React from 'react';
import { reduxForm } from 'redux-form';
import { bindActionCreators } from 'redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Helmet } from 'react-helmet';
import { withTranslation } from 'react-i18next';
import { updateSettings, initiateVerification, createApiKey, removeApiKey } from '../actions';
import AccountForm from '../components/AccountForm';
import apiClient from '../../../utils/apiClient';
import { validateSettings } from '../../../utils/reduxFormUtils';
import SocialAuthButton from '../components/SocialAuthButton';
import APIKeyForm from '../components/APIKeyForm';
import Nav from '../../../components/Nav';

function SocialLoginPanel(props) {
  const { user } = props;
  return (
    <React.Fragment>
      <AccountForm {...props} />
      {/* eslint-disable-next-line react/prop-types */}
      <h2 className="form-container__divider">{props.t('AccountView.SocialLogin')}</h2>
      <p className="account__social-text">
        {/* eslint-disable-next-line react/prop-types */}
        {props.t('AccountView.SocialLoginDescription')}
      </p>
      <div className="account__social-stack">
        <SocialAuthButton
          service={SocialAuthButton.services.github}
          linkStyle
          isConnected={!!user.github}
        />
        <SocialAuthButton
          service={SocialAuthButton.services.google}
          linkStyle
          isConnected={!!user.google}
        />
      </div>
    </React.Fragment>
  );
}

SocialLoginPanel.propTypes = {
  user: PropTypes.shape({
    github: PropTypes.string,
    google: PropTypes.string
  }).isRequired
};

class AccountView extends React.Component {
  componentDidMount() {
    document.body.className = this.props.theme;
  }

  render() {
    const accessTokensUIEnabled = window.process.env.UI_ACCESS_TOKEN_ENABLED;

    return (
      <div className="account-settings__container">
        <Helmet>
          <title>{this.props.t('AccountView.Title')}</title>
        </Helmet>

        <Nav layout="dashboard" />

        <main className="account-settings">
          <header className="account-settings__header">
            <h1 className="account-settings__title">{this.props.t('AccountView.Settings')}</h1>
          </header>
          {accessTokensUIEnabled &&
            <Tabs className="account__tabs">
              <TabList>
                <div className="tabs__titles">
                  <Tab><h4 className="tabs__title">{this.props.t('AccountView.AccountTab')}</h4></Tab>
                  {accessTokensUIEnabled && <Tab><h4 className="tabs__title">{this.props.t('AccountView.AccessTokensTab')}</h4></Tab>}
                </div>
              </TabList>
              <TabPanel>
                <SocialLoginPanel {...this.props} />
              </TabPanel>
              <TabPanel>
                <APIKeyForm {...this.props} />
              </TabPanel>
            </Tabs>
          }
          { !accessTokensUIEnabled && <SocialLoginPanel {...this.props} /> }
        </main>
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
    return apiClient.get('/signup/duplicate_check', { params: queryParams })
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
  theme: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
};

export default withTranslation()(reduxForm({
  form: 'updateAllSettings',
  fields: ['username', 'email', 'currentPassword', 'newPassword'],
  validate: validateSettings,
  asyncValidate,
  asyncBlurFields: ['username', 'email', 'currentPassword']
}, mapStateToProps, mapDispatchToProps)(AccountView));
