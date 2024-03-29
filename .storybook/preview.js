import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import configureStore from '../client/store';
import '../client/i18n-test';
import '../client/styles/storybook.css'
import { withThemeProvider, themeToolbarItem } from './decorator-theme';

const initialState = window.__INITIAL_STATE__;

const store = configureStore(initialState);

export const decorators = [
  (Story) => (
    <Provider store={store}>
      <MemoryRouter>
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      </MemoryRouter>
    </Provider>
  ),
  withThemeProvider
];

export const globalTypes = {
  theme: themeToolbarItem
};
