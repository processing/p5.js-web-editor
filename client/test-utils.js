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
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { Context as ResponsiveContext } from 'react-responsive';

import i18n from './i18n-test';
import ThemeProvider from './modules/App/components/ThemeProvider';
import configureStore from './store';
import theme, { Theme } from './theme';

export const history = createMemoryHistory();

// re-export everything
// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@testing-library/react';

const ResponsiveProvider = ({ children, mobile, deviceWidth }) => {
  const width = deviceWidth ?? (mobile ? 400 : 1000);
  return (
    // eslint-disable-next-line react/jsx-filename-extension
    <ResponsiveContext.Provider value={{ width }}>
      {children}
    </ResponsiveContext.Provider>
  );
};

ResponsiveProvider.propTypes = {
  children: PropTypes.element.isRequired,
  mobile: PropTypes.bool,
  deviceWidth: PropTypes.number
};

ResponsiveProvider.defaultProps = {
  mobile: false,
  deviceWidth: undefined
};

const Providers = ({ children, ...options }) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <StyledThemeProvider theme={{ ...theme[Theme.light] }}>
    <I18nextProvider i18n={i18n}>
      <ResponsiveProvider {...options}>
        <Router history={history}>{children}</Router>
      </ResponsiveProvider>
    </I18nextProvider>
  </StyledThemeProvider>
);

Providers.propTypes = {
  children: PropTypes.element.isRequired
};

/**
 * @typedef {import('@testing-library/react').RenderOptions} RenderOptions
 * @typedef {import('@testing-library/react').RenderResult} RenderResult
 */

/**
 * @typedef {object} CustomRenderOptions
 * @extends RenderOptions
 * @property {boolean} [mobile] - Can use options { mobile: true } or { mobile: false } to determine which `react-responsive` media queries will match.
 * @property {number} [deviceWidth] - Can set a specific device width, if testing more than 2 breakpoints. ie. { deviceWidth: 700 }
 */

/**
 * @typedef {object} ReduxRenderOptions
 * @extends CustomRenderOptions
 * @property [initialState] - Can pass in a partial initialState for the Redux store, to be shallow merged with the default state. // TODO: deep merge
 * @property {import('redux').Store} [store] - Can use a custom store instance.
 */

/**
 * @param {React.ReactElement} ui
 * @param {ReduxRenderOptions & CustomRenderOptions & RenderOptions} [options]
 * @return {RenderResult & { store: import('redux').Store }}
 */
function reduxRender(
  ui,
  { initialState, store = configureStore(initialState), ...renderOptions } = {}
) {
  function Wrapper({ children }) {
    return (
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          <ThemeProvider>
            <ResponsiveProvider {...renderOptions}>
              <Router history={history}>{children}</Router>
            </ResponsiveProvider>
          </ThemeProvider>
        </Provider>
      </I18nextProvider>
    );
  }

  Wrapper.propTypes = {
    children: PropTypes.element.isRequired
  };

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * @param {React.ReactElement} ui
 * @param {CustomRenderOptions & RenderOptions} [options]
 * @return {RenderResult}
 */
const customRender = (ui, options) =>
  // Pass options to Provider, see: https://github.com/testing-library/react-testing-library/issues/780#issuecomment-687525893
  render(ui, {
    wrapper: (props) => <Providers {...props} {...options} />,
    ...options
  });

// override render method
export { customRender as render, reduxRender };
