import React, { Suspense, useEffect } from 'react';
import { render } from 'react-dom';
import { Provider, useSelector } from 'react-redux';
import { Router } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import browserHistory from './browserHistory';
import configureStore from './store';
import Routing from './routes';
import ThemeProvider from './modules/App/components/ThemeProvider';
import Loader from './modules/App/components/loader';
import './i18n';
import { SkipLink } from './components/SkipLink';

require('./styles/main.scss');

// Load the p5 png logo, so that webpack will use it
require('./images/p5js-square-logo.png');

const initialState = window.__INITIAL_STATE__;

const store = configureStore(initialState);

const DONATE_LOGO_IMAGE_URL = 'https://donorbox.org/images/white_logo.svg';

if (
  window.location.href.indexOf('full') === -1 &&
  window.location.href.indexOf('embed') === -1
) {
  // Add a banner to the page
  const banner = document.createElement('div');
  banner.id = 'processing-banner';
  document.body.appendChild(banner);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://foundation-donate-banner.netlify.app/static/css/main.css';
  document.head.appendChild(link);

  const script = document.createElement('script');
  script.src = 'https://foundation-donate-banner.netlify.app/static/js/main.js';
  document.body.appendChild(script);

  const buttonScript = document.createElement('script');
  buttonScript.type = 'text/javascript';
  buttonScript.defer = true;
  buttonScript.id = 'donorbox-popup-button-installer';
  buttonScript.src = 'https://donorbox.org/install-popup-button.js';

  buttonScript.setAttribute(
    'data-href',
    'https://donorbox.org/back-to-school-805292'
  );
  buttonScript.setAttribute(
    'data-style',
    // eslint-disable-next-line max-len
    'background: #f1678e; color: #fff; text-decoration: none; font-family: Verdana, sans-serif; display: flex; gap: 8px; width: fit-content; font-size: 16px; border-radius: 0 0 5px 5px; line-height: 24px; position: fixed; top: 50%; transform-origin: center; z-index: 9999; overflow: hidden; padding: 8px 22px 8px 18px; right: 20px; left: auto; transform: translate(50%, -50%) rotate(90deg)'
  );
  buttonScript.setAttribute('data-button-cta', 'Donate');
  buttonScript.setAttribute('data-img-src', DONATE_LOGO_IMAGE_URL);

  document.body.appendChild(buttonScript);
}

const App = () => {
  const { t } = useTranslation();
  const language = useSelector((state) => state.preferences.language);

  useEffect(() => {
    setTimeout(() => {
      const donateButton = document.getElementsByClassName(
        'dbox-donation-button'
      )[0];

      if (donateButton) {
        const donateLogoImage = document.createElement('img');
        donateLogoImage.src = DONATE_LOGO_IMAGE_URL;

        donateButton.text = t('About.Donate');
        donateButton.prepend(donateLogoImage);
      }
    }, 500);
  }, [language]);

  return (
    <div>
      <Router history={browserHistory}>
        <SkipLink targetId="play-sketch" text="PlaySketch" />
        <Routing />
      </Router>
    </div>
  );
};

// This prevents crashes in test environments (like Jest) where document.getElementById('root') may return null.
const rootEl = document.getElementById('root');
if (rootEl) {
  render(
    <Provider store={store}>
      <ThemeProvider>
        <Suspense fallback={<Loader />}>
          <App />
        </Suspense>
      </ThemeProvider>
    </Provider>,
    rootEl
  );
}

export default store;
