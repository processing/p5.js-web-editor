import PropTypes from 'prop-types';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Helmet } from 'react-helmet';
import { useTranslation, withTranslation } from 'react-i18next';
import { withRouter, browserHistory } from 'react-router';
import { parse } from 'query-string';
import { createApiKey, removeApiKey } from '../actions';
import AccountForm from '../components/AccountForm';
import SocialAuthButton from '../components/SocialAuthButton';
import APIKeyForm from '../components/APIKeyForm';
import Nav from '../../../components/Nav';
import ErrorModal from '../../IDE/components/ErrorModal';
import Overlay from '../../App/components/Overlay';
import Toast from '../../IDE/components/Toast';

function SocialLoginPanel() {
  const { t } = useTranslation();
  const isGithub = useSelector((state) => !!state.user.github);
  const isGoogle = useSelector((state) => !!state.user.google);
  return (
    <React.Fragment>
      <AccountForm />
      <h2 className="form-container__divider">
        {t('AccountView.SocialLogin')}
      </h2>
      <p className="account__social-text">
        {t('AccountView.SocialLoginDescription')}
      </p>
      <div className="account__social-stack">
        <SocialAuthButton
          service={SocialAuthButton.services.github}
          linkStyle
          isConnected={isGithub}
        />
        <SocialAuthButton
          service={SocialAuthButton.services.google}
          linkStyle
          isConnected={isGoogle}
        />
      </div>
    </React.Fragment>
  );
}

class AccountView extends React.Component {
  componentDidMount() {
    document.body.className = this.props.theme;
  }

  render() {
    const queryParams = parse(this.props.location.search);
    const showError = !!queryParams.error;
    const errorType = queryParams.error;
    const accessTokensUIEnabled = window.process.env.UI_ACCESS_TOKEN_ENABLED;

    return (
      <div className="account-settings__container">
        <Helmet>
          <title>{this.props.t('AccountView.Title')}</title>
        </Helmet>
        <Toast />

        <Nav layout="dashboard" />

        {showError && (
          <Overlay
            title={this.props.t('ErrorModal.LinkTitle')}
            ariaLabel={this.props.t('ErrorModal.LinkTitle')}
            closeOverlay={() => {
              browserHistory.push(this.props.location.pathname);
            }}
          >
            <ErrorModal type="oauthError" service={errorType} />
          </Overlay>
        )}

        <main className="account-settings">
          <header className="account-settings__header">
            <h1 className="account-settings__title">
              {this.props.t('AccountView.Settings')}
            </h1>
          </header>
          {accessTokensUIEnabled && (
            <Tabs className="account__tabs">
              <TabList>
                <div className="tabs__titles">
                  <Tab>
                    <h4 className="tabs__title">
                      {this.props.t('AccountView.AccountTab')}
                    </h4>
                  </Tab>
                  {accessTokensUIEnabled && (
                    <Tab>
                      <h4 className="tabs__title">
                        {this.props.t('AccountView.AccessTokensTab')}
                      </h4>
                    </Tab>
                  )}
                </div>
              </TabList>
              <TabPanel>
                <SocialLoginPanel />
              </TabPanel>
              <TabPanel>
                <APIKeyForm {...this.props} />
              </TabPanel>
            </Tabs>
          )}
          {!accessTokensUIEnabled && <SocialLoginPanel />}
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
  return bindActionCreators(
    {
      createApiKey,
      removeApiKey
    },
    dispatch
  );
}

AccountView.propTypes = {
  previousPath: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
    pathname: PropTypes.string.isRequired
  }).isRequired
};

export default withTranslation()(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(AccountView))
);
