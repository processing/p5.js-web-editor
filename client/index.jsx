import React, { Suspense } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import browserHistory from './browserHistory';
import configureStore from './store';
import Routing from './routes';
import ThemeProvider from './modules/App/components/ThemeProvider';
import Loader from './modules/App/components/loader';
import './i18n';
import SkipLink from './components/SkipLink';

require('./styles/main.scss');

// Load the p5 png logo, so that webpack will use it
require('./images/p5js-square-logo.png');

const initialState = window.__INITIAL_STATE__;

const store = configureStore(initialState);

const App = () => (
  <>
    <Router history={browserHistory}>
      <SkipLink targetId="play-sketch" text="PlaySketch" />
      <Routing />
    </Router>
  </>
);

render(
  <Provider store={store}>
    <ThemeProvider>
      <Suspense fallback={<Loader />}>
        <App />
      </Suspense>
    </ThemeProvider>
  </Provider>,
  document.getElementById('root')
);
