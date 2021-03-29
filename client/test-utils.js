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

import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from 'styled-components';

import i18n from './i18n-test';
import theme, { Theme } from './theme';

// re-export everything
// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@testing-library/react';

const Providers = ({ children }) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <ThemeProvider theme={{ ...theme[Theme.light] }}>
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  </ThemeProvider>
);

Providers.propTypes = {
  children: PropTypes.element.isRequired
};

const customRender = (ui, options) =>
  render(ui, { wrapper: Providers, ...options });

// override render method
export { customRender as render };
