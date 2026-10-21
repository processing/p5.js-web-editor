import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { parse } from 'query-string';
import { AccountForm } from '../components/AccountForm';
import {
  SocialAuthButton,
  SocialAuthServices
} from '../components/SocialAuthButton';
import { APIKeyForm } from '../components/APIKeyForm';
import { StepUpModal } from '../components/StepUpModal';
import Nav from '../../IDE/components/Header/Nav';
import ErrorModal from '../../IDE/components/ErrorModal';
import { hideErrorModal } from '../../IDE/actions/ide';
import { Overlay } from '../../App/components/Overlay';
import Toast from '../../IDE/components/Toast';
import { RootState } from '../../../reducers';
import { resetPasswordReset } from '../actions';
import { registerStepUpRequester } from '../stepUp';

function SocialLoginPanel() {
  const { t } = useTranslation();
  const isGithub = useSelector((state: RootState) => !!state.user.github);
  const isGoogle = useSelector((state: RootState) => !!state.user.google);
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
          service={SocialAuthServices.github}
          linkStyle
          isConnected={isGithub}
        />
        <SocialAuthButton
          service={SocialAuthServices.google}
          linkStyle
          isConnected={isGoogle}
        />
      </div>
    </React.Fragment>
  );
}

export function AccountView() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetPasswordReset());
  }, [dispatch]);
  const location = useLocation();
  const queryParams = parse(location.search);
  const errorType = queryParams.error as string | undefined;
  const isStepUpRedirect = errorType === 'stepUpRequired';
  const showError = !!errorType && !isStepUpRedirect;
  const accessTokensUIEnabled = window.process.env.UI_ACCESS_TOKEN_ENABLED;
  const history = useHistory();

  const [stepUpOpen, setStepUpOpen] = useState(isStepUpRedirect);
  const resolverRef = useRef<((verified: boolean) => void) | null>(null);

  const openStepUp = useCallback(() => {
    setStepUpOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  useEffect(() => {
    registerStepUpRequester(openStepUp);
    return () => registerStepUpRequester(null);
  }, [openStepUp]);

  useEffect(() => {
    if (isStepUpRedirect) {
      setStepUpOpen(true);
    }
  }, [isStepUpRedirect]);

  const clearQueryAndClose = useCallback(
    (verified: boolean) => {
      setStepUpOpen(false);
      if (isStepUpRedirect) {
        history.push(location.pathname);
      }
      const resolve = resolverRef.current;
      resolverRef.current = null;
      if (resolve) {
        resolve(verified);
      }
    },
    [history, isStepUpRedirect, location.pathname]
  );

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
          <ErrorModal
            type="oauthError"
            service={errorType}
            closeModal={() => dispatch(hideErrorModal())}
          />
        </Overlay>
      )}

      <StepUpModal
        isOpen={stepUpOpen}
        onClose={() => clearQueryAndClose(false)}
        onVerified={() => clearQueryAndClose(true)}
      />

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
