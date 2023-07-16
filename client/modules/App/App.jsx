import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import getConfig from '../../utils/getConfig';
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

// TODO: get location from `useLocation` after upgrading react-router to v5.
const App = ({ children, location }) => {
  const dispatch = useDispatch();

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
    const locationChanged =
      prevLocation && prevLocation.pathname !== location.pathname;
    const shouldSkipRemembering = location.state?.skipSavingPath === true;

    if (locationChanged && !shouldSkipRemembering) {
      dispatch(setPreviousPath(location.pathname));
    }
    previousLocationRef.current = location;
  }, [location]);

  const hide = hideCookieConsent(location.pathname);

  return (
    <div className="app">
      <CookieConsent hide={hide} />
      {isMounted &&
        !window.devToolsExtension &&
        getConfig('NODE_ENV') === 'development' && <DevTools />}
      {children}
    </div>
  );
};

App.propTypes = {
  children: PropTypes.element,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    state: PropTypes.shape({
      skipSavingPath: PropTypes.bool
    })
  }).isRequired
};

App.defaultProps = {
  children: null
};

export default App;
