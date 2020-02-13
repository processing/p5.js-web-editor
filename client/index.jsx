import React from 'react';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader';

import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import configureStore from './store';
import routes from './routes';

require('./styles/main.scss');

// Load the p5 png logo, so that webpack will use it
require('./images/p5js-square-logo.png');

const history = browserHistory;
const initialState = window.__INITIAL_STATE__;

const store = configureStore(initialState);

const App = () => (
  <Provider store={store}>
    <Router history={history} routes={routes(store)} />
  </Provider>
);

// https://github.com/gaearon/react-hot-loader/pull/1223
const HotApp = hot(module)(App);

render(
  <HotApp />,
  document.getElementById('root')
);
