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
import './styles/main.scss';

// Load the p5 png logo, so that webpack will use it
import './images/p5js-square-logo.png';

const initialState = window.__INITIAL_STATE__;

const App = ({ store }) => (
  <Provider store={store}>
    <ThemeProvider>
      <Router history={browserHistory}>
        <Routing />
      </Router>
    </ThemeProvider>
  </Provider>
);

const Root = () => {
  const store = configureStore(initialState);

  return (
    <Suspense fallback={<Loader />}>
      <App store={store} />
    </Suspense>
  );
};

render(<Root />, document.getElementById('root'));
