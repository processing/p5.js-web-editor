import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import styled from 'styled-components';
import getConfig from '../../../utils/getConfig';
import { setUserCookieConsent } from '../actions';
import { remSize, prop } from '../../../theme';
import Button from '../../../common/Button';

const CookieConsentContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
`;

const CookieConsentDialog = styled.div`
  width: 100%;
  height: 100%;
  background: ${prop('Modal.background')};
  border-top: 1px solid ${prop('Separator')};
  padding: ${remSize(40)} ${remSize(60)};
`;

const CookieConsentHeader = styled.h2`
  margin-bottom: ${remSize(20)};
`;

const CookieConsentContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CookieConsentCopy = styled.p``;

const CookieConsentButtons = styled.div`
  display: flex;
  align-items: center;
  margin-left: ${remSize(60)};
  & button:not(:last-child) {
    margin-right: ${remSize(20)};
  }
`;

function CookieConsent() {
  const user = useSelector((state) => state.user);
  const [cookieConsent, setBrowserCookieConsent] = useState('none');
  const dispatch = useDispatch();

  function initializeCookieConsent() {
    if (user.authenticated) {
      setBrowserCookieConsent(user.cookieConsent);
      Cookies.set('p5-cookie-consent', user.cookieConsent, { expires: 365 });
      return;
    }
    setBrowserCookieConsent('none');
    Cookies.set('p5-cookie-consent', 'none', { expires: 365 });
  }

  function acceptAllCookies() {
    if (user.authenticated) {
      dispatch(setUserCookieConsent('all'));
      return;
    }
    setBrowserCookieConsent('all');
    Cookies.set('p5-cookie-consent', 'all', { expires: 365 });
  }

  function acceptEssentialCookies() {
    if (user.authenticated) {
      dispatch(setUserCookieConsent('essential'));
      return;
    }
    setBrowserCookieConsent('essential');
    Cookies.set('p5-cookie-consent', 'essential', { expires: 365 });
  }

  function mergeCookieConsent() {
    if (user.authenticated) {
      if (user.cookieConsent === 'none' && cookieConsent !== 'none') {
        dispatch(setUserCookieConsent(cookieConsent));
      } else if (user.cookieConsent !== 'none') {
        setBrowserCookieConsent(user.cookieConsent);
        Cookies.set('p5-cookie-consent', user.cookieConsent, { expires: 365 });
      }
    }
  }

  useEffect(() => {
    const p5CookieConsent = Cookies.get('p5-cookie-consent');
    if (p5CookieConsent) {
      setBrowserCookieConsent(p5CookieConsent);
    } else {
      initializeCookieConsent();
    }
  }, []);

  useEffect(() => {
    mergeCookieConsent();
  }, [user.authenticated]);

  // Turn off Google Analytics
  useEffect(() => {
    if (cookieConsent === 'essential' || user.cookieConsent === 'essential') {
      window[`ga-disable-${getConfig('GA_MEASUREMENT_ID')}`] = true;
    }
  }, [cookieConsent, user.cookieConsent]);

  const showCookieConsent =
    (user.authenticated && user.cookieConsent === 'none') ||
    (!user.authenticated && cookieConsent === 'none');

  if (!showCookieConsent) return null;

  return (
    <CookieConsentContainer>
      <CookieConsentDialog role="dialog" tabIndex="0">
        {/* <button aria-label="Close" tabIndex="0"></button> */}
        <CookieConsentHeader>Cookies</CookieConsentHeader>
        <CookieConsentContent>
          <CookieConsentCopy>
            The p5.js Editor uses cookies. Some are essential to the website
            functionality and allow you to manage an account and preferences.
            Others are used for analytics allow us to gather information and
            make improvements. You can decide which cookies you would like to
            allow.
          </CookieConsentCopy>
          <CookieConsentButtons>
            <Button onClick={acceptAllCookies}>Allow All</Button>
            <Button onClick={acceptEssentialCookies}>Allow Essential</Button>
          </CookieConsentButtons>
        </CookieConsentContent>
      </CookieConsentDialog>
    </CookieConsentContainer>
  );
}
// TODO need to merge browser cookie with user when u login

export default CookieConsent;
