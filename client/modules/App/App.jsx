import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { showReduxDevTools } from '../../store';
import DevTools from './components/DevTools';
import { setPreviousPath } from '../IDE/actions/ide';
import { setLanguage } from '../IDE/actions/preferences';
import CookieConsent from '../User/components/CookieConsent';

function hideCookieConsent(pathname) {
  if (pathname.includes('/full/') || pathname.includes('/embed/')) {
    return true;
  }
  return false;
}

const App = ({ children }) => {
  const dispatch = useDispatch();

  const location = useLocation();

  const theme = useSelector((state) => state.preferences.theme);
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // TODO: this is only needed for the initial load and would be better handled elsewhere - Linda
  const language = useSelector((state) => state.preferences.language);
  useEffect(() => {
    dispatch(setLanguage(language, { persistPreference: false }));
  }, [language]);

  // TODO: do we actually need this? - Linda
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const previousLocationRef = useRef(location);
  useEffect(() => {
    const prevLocation = previousLocationRef.current;
    const locationChanged = prevLocation && prevLocation !== location;
    const shouldSkipRemembering = location.state?.skipSavingPath === true;

    if (locationChanged && !shouldSkipRemembering) {
      dispatch(setPreviousPath(prevLocation.pathname));
    }
    previousLocationRef.current = location;
  }, [location]);

  const hide = hideCookieConsent(location.pathname);

  return (
    <div className="app">
      <CookieConsent hide={hide} />
      {isMounted && showReduxDevTools() && <DevTools />}
      {children}
    </div>
  );
};

App.propTypes = {
  children: PropTypes.element
};

App.defaultProps = {
  children: null
};

export default App;
