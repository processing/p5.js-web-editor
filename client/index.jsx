import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import configureStore from './store';
import routes from './routes';

require('./styles/main.scss');

const history = browserHistory;
const initialState = window.__INITIAL_STATE__;
const store = configureStore(initialState);

render(
  <Provider store={store}>
    <Router history={history} routes={routes(store)} />
  </Provider>,
	document.getElementById('root')
);
