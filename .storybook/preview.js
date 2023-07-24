import React from 'react';
import { Provider } from 'react-redux';

import ThemeProvider from '../client/modules/App/components/ThemeProvider';
import configureStore from '../client/store';
import '../client/styles/build/css/main.css'

const initialState = window.__INITIAL_STATE__;

const store = configureStore(initialState);

export const decorators = [
  (Story) => (
    <Provider store={store}>
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    </Provider>
  ),
]

