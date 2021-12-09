/**
 * This file re-exports @testing-library but ensures that
 * any calls to render have translations and theme available.
 *
 * This means tested components will be able to call
 * `t()` and have the translations of the default
 * language also components will be able to call
 * `prop()` and have the theming of the default theme.
 *
 * For i18n see: https://react.i18next.com/misc/testing#testing-without-stubbing
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { render } from '@testing-library/react';
import React from 'react';
import PropTypes from 'prop-types';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import { I18nextProvider } from 'react-i18next';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

import i18n from './i18n-test';
import rootReducer from './reducers';
import ThemeProvider from './modules/App/components/ThemeProvider';
import theme, { Theme } from './theme';

// re-export everything
// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@testing-library/react';

const Providers = ({ children }) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <StyledThemeProvider theme={{ ...theme[Theme.light] }}>
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  </StyledThemeProvider>
);

Providers.propTypes = {
  children: PropTypes.element.isRequired
};

function reduxRender(
  ui,
  {
    initialState,
    store = createStore(rootReducer, initialState),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          <ThemeProvider>{children}</ThemeProvider>
        </Provider>
      </I18nextProvider>
    );
  }

  Wrapper.propTypes = {
    children: PropTypes.element.isRequired
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

const customRender = (ui, options) =>
  render(ui, { wrapper: Providers, ...options });

// override render method
export { customRender as render, reduxRender };
