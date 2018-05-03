import React from 'react';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import configureStore from './store';
import routes from './routes';

require('./styles/main.scss');

const history = browserHistory;
const initialState = window.__INITIAL_STATE__;
const store = configureStore(initialState);

const App = () => (
  <Provider store={store}>
    <Router history={history} routes={routes(store)} />
  </Provider>
);

const HotApp = hot(module)(App);

render(
  <HotApp />,
  document.getElementById('root')
);
