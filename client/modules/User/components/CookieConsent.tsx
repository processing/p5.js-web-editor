import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import styled from 'styled-components';
import ReactGA from 'react-ga';
import { Transition } from 'react-transition-group';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { getConfig } from '../../../utils/getConfig';
import { remSize, prop, device } from '../../../theme';
import { Button, ButtonKinds } from '../../../common/Button';
import { CookieConsentOptions } from '../../../../common/types';

interface CookieConsentContainerState {
  state: string;
}
const CookieConsentContainer = styled.div`
  position: fixed;
  transition: 1.6s cubic-bezier(0.165, 0.84, 0.44, 1);
  bottom: 0;
  transform: ${({ state }: CookieConsentContainerState) => {
    if (state === 'entered') {
      return 'translateY(0)';
    }
    return 'translateY(105%)';
  }};
  left: 0;
  right: 0;
  z-index: 9999;
  @media print {
    display: none;
  }
`;

const CookieConsentDialog = styled.div`
  width: 100%;
  height: 100%;
  background: ${prop('Modal.background')};
  color: ${prop('primaryTextColor')};
  border-top: 1px solid ${prop('Separator')};
  padding: ${remSize(20)} ${remSize(30)};
  @media ${device.desktop} {
    padding: ${remSize(40)} ${remSize(60)};
  }
`;

const CookieConsentHeader = styled.h2`
  margin-bottom: ${remSize(20)};
`;

const CookieConsentContent = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  @media ${device.desktop} {
    flex-direction: row;
  }
`;

const CookieConsentCopy = styled.p`
  line-height: 1.5em;
  margin-bottom: ${remSize(20)};
  @media ${device.desktop} {
    margin-bottom: 0;
  }
  & a {
    color: ${prop('Policy.link')};
  }
`;

const CookieConsentButtons = styled.div`
  display: flex;
  align-items: center;
  & button:not(:last-child) {
    margin-right: ${remSize(20)};
  }
  @media ${device.desktop} {
    margin-left: ${remSize(60)};
  }
`;

const GOOGLE_ANALYTICS_ID = getConfig('GA_MEASUREMENT_ID');
const COOKIE_CONSENT_KEY = 'p5-cookie-consent';

function readCookieConsentCookie(): CookieConsentOptions {
  const cookieValue = Cookies.get(COOKIE_CONSENT_KEY);
  if (
    cookieValue &&
    Object.values(CookieConsentOptions).includes(
      cookieValue as CookieConsentOptions
    )
  ) {
    return cookieValue as CookieConsentOptions;
  }

  return CookieConsentOptions.NONE;
}

export function CookieConsent({ hide = false }: { hide?: boolean }) {
  const [
    cookieConsent,
    setBrowserCookieConsent
  ] = useState<CookieConsentOptions>(CookieConsentOptions.NONE);
  const [inProp, setInProp] = useState(false);
  const { t } = useTranslation();

  function acceptAllCookies() {
    setBrowserCookieConsent(CookieConsentOptions.ALL);
    Cookies.set(COOKIE_CONSENT_KEY, CookieConsentOptions.ALL, {
      expires: 365
    });
  }

  function acceptEssentialCookies() {
    setBrowserCookieConsent(CookieConsentOptions.ESSENTIAL);
    Cookies.set(COOKIE_CONSENT_KEY, CookieConsentOptions.ESSENTIAL, {
      expires: 365
    });
    // Remove Google Analytics Cookies
    Cookies.remove('_ga');
    Cookies.remove('_gat');
    Cookies.remove('_gid');
  }

  useEffect(() => {
    const p5CookieConsent = readCookieConsentCookie();
    setBrowserCookieConsent(p5CookieConsent);

    if (GOOGLE_ANALYTICS_ID) {
      if (p5CookieConsent === CookieConsentOptions.ESSENTIAL) {
        ReactGA.initialize(GOOGLE_ANALYTICS_ID, {
          gaOptions: {
            storage: 'none'
          }
        });
      } else {
        ReactGA.initialize(GOOGLE_ANALYTICS_ID);
      }
      ReactGA.pageview(window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    if (cookieConsent !== 'none') {
      setInProp(false);
    } else {
      setInProp(true);
    }
  }, [cookieConsent]);

  if (hide || cookieConsent !== 'none') return null;

  return (
    <Transition in={inProp} timeout={500}>
      {(state: CookieConsentContainerState['state']) => (
        <CookieConsentContainer state={state}>
          <CookieConsentDialog role="dialog" tabIndex={0}>
            <CookieConsentHeader>{t('Cookies.Header')}</CookieConsentHeader>
            <CookieConsentContent>
              <CookieConsentCopy>
                <Trans
                  i18nKey="Cookies.Body"
                  components={[<Link to="/privacy-policy" />]}
                />
              </CookieConsentCopy>
              <CookieConsentButtons>
                <Button kind={ButtonKinds.SECONDARY} onClick={acceptAllCookies}>
                  {t('Cookies.AllowAll')}
                </Button>
                <Button onClick={acceptEssentialCookies}>
                  {t('Cookies.AllowEssential')}
                </Button>
              </CookieConsentButtons>
            </CookieConsentContent>
          </CookieConsentDialog>
        </CookieConsentContainer>
      )}
    </Transition>
  );
}
