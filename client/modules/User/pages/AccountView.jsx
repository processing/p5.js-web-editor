import React from 'react';
import { useSelector } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { parse } from 'query-string';
import AccountForm from '../components/AccountForm';
import SocialAuthButton from '../components/SocialAuthButton';
import APIKeyForm from '../components/APIKeyForm';
import Nav from '../../IDE/components/Header/Nav';
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

function AccountView() {
  const { t } = useTranslation();

  const location = useLocation();
  const queryParams = parse(location.search);
  const showError = !!queryParams.error;
  const errorType = queryParams.error;
  const accessTokensUIEnabled = window.process.env.UI_ACCESS_TOKEN_ENABLED;
  const history = useHistory();

  return (
    <div className="account-settings__container">
      <Helmet>
        <title>{t('AccountView.Title')}</title>
      </Helmet>
      <Toast />

      <Nav layout="dashboard" />

      {showError && (
        <Overlay
          title={t('ErrorModal.LinkTitle')}
          ariaLabel={t('ErrorModal.LinkTitle')}
          closeOverlay={() => {
            history.push(location.pathname);
          }}
        >
          <ErrorModal type="oauthError" service={errorType} />
        </Overlay>
      )}

      <main className="account-settings">
        <header className="account-settings__header">
          <h1 className="account-settings__title">
            {t('AccountView.Settings')}
          </h1>
        </header>
        {accessTokensUIEnabled && (
          <Tabs className="account__tabs">
            <TabList>
              <div className="tabs__titles">
                <Tab>
                  <h4 className="tabs__title">{t('AccountView.AccountTab')}</h4>
                </Tab>
                {accessTokensUIEnabled && (
                  <Tab>
                    <h4 className="tabs__title">
                      {t('AccountView.AccessTokensTab')}
                    </h4>
                  </Tab>
                )}
              </div>
            </TabList>
            <TabPanel>
              <SocialLoginPanel />
            </TabPanel>
            <TabPanel>
              <APIKeyForm />
            </TabPanel>
          </Tabs>
        )}
        {!accessTokensUIEnabled && <SocialLoginPanel />}
      </main>
    </div>
  );
}

export default AccountView;
