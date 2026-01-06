import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import styled from 'styled-components';
import ReactGA from 'react-ga';
import { Transition } from 'react-transition-group';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { getConfig } from '../../../utils/getConfig';
import { setUserCookieConsent } from '../actions';
import { remSize, prop, device } from '../../../theme';
import { Button, ButtonKinds } from '../../../common/Button';
import { RootState } from '../../../reducers';
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

export function CookieConsent({ hide = false }: { hide?: boolean }) {
  const user = useSelector((state: RootState) => state.user);
  const [
    cookieConsent,
    setBrowserCookieConsent
  ] = useState<CookieConsentOptions>(CookieConsentOptions.NONE);
  const [inProp, setInProp] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  function initializeCookieConsent() {
    if (user.authenticated) {
      if (!user.cookieConsent) {
        return;
      }
      setBrowserCookieConsent(user.cookieConsent);
      Cookies.set('p5-cookie-consent', user.cookieConsent, { expires: 365 });
      return;
    }
    setBrowserCookieConsent(CookieConsentOptions.NONE);
    Cookies.set('p5-cookie-consent', CookieConsentOptions.NONE, {
      expires: 365
    });
  }

  function acceptAllCookies() {
    if (user.authenticated) {
      dispatch(setUserCookieConsent(CookieConsentOptions.ALL));
    }
    setBrowserCookieConsent(CookieConsentOptions.ALL);
    Cookies.set('p5-cookie-consent', CookieConsentOptions.ALL, {
      expires: 365
    });
  }

  function acceptEssentialCookies() {
    if (user.authenticated) {
      dispatch(setUserCookieConsent(CookieConsentOptions.ESSENTIAL));
    }
    setBrowserCookieConsent(CookieConsentOptions.ESSENTIAL);
    Cookies.set('p5-cookie-consent', CookieConsentOptions.ESSENTIAL, {
      expires: 365
    });
    // Remove Google Analytics Cookies
    Cookies.remove('_ga');
    Cookies.remove('_gat');
    Cookies.remove('_gid');
  }

  function mergeCookieConsent() {
    if (user.authenticated) {
      if (!user.cookieConsent) {
        user.cookieConsent = CookieConsentOptions.NONE;
      }
      if (
        user.cookieConsent === CookieConsentOptions.NONE &&
        cookieConsent !== CookieConsentOptions.NONE
      ) {
        dispatch(setUserCookieConsent(cookieConsent as CookieConsentOptions));
      } else if (user.cookieConsent !== CookieConsentOptions.NONE) {
        setBrowserCookieConsent(user.cookieConsent);
        Cookies.set('p5-cookie-consent', user.cookieConsent, {
          expires: 365
        });
      }
    }
  }

  useEffect(() => {
    const p5CookieConsent = Cookies.get('p5-cookie-consent');
    if (p5CookieConsent) {
      setBrowserCookieConsent(p5CookieConsent as CookieConsentOptions);
    } else {
      initializeCookieConsent();
    }

    if (GOOGLE_ANALYTICS_ID) {
      if (p5CookieConsent === 'essential') {
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
    mergeCookieConsent();
  }, [user.authenticated]);

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
