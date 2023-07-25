import React from 'react';
import { Provider } from 'react-redux';

import configureStore from '../client/store';
import '../client/i18n-test';
import '../client/styles/build/css/main.css';
import { withThemeProvider, themeToolbarItem } from './decorator-theme';

const initialState = window.__INITIAL_STATE__;

const store = configureStore(initialState);

export const decorators = [
  (Story) => (
    <Provider store={store}>
      <Story />
    </Provider>
  ),
  withThemeProvider
];

export const globalTypes = {
  theme: themeToolbarItem
};
