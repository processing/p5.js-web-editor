import { configureStore } from '@reduxjs/toolkit';
import listenerMiddleware from './middleware';
import { DevTools } from './modules/App/components/DevTools';
import rootReducer from './reducers';
import type { RootState } from './reducers';
import { clearState, loadState } from './persistState';
import { getConfig } from './utils/getConfig';
import { parseBoolean } from './utils/parseStringToType';

// Enable DevTools only when rendering on client and during development.
// Display the dock monitor only if no browser extension is found.
export function showReduxDevTools() {
  return (
    parseBoolean(getConfig('CLIENT'), true) &&
    getConfig('NODE_ENV') === 'development' &&
    !window.__REDUX_DEVTOOLS_EXTENSION__
  );
}

export function setupStore(initialState: RootState) {
  const savedState = loadState();
  clearState();

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: true,
        serializableCheck: false,
        // TODO: enable immutableCheck once the mutations are fixed.
        immutableCheck: false
      }).concat(listenerMiddleware.middleware),
    preloadedState: savedState || initialState,
    enhancers: showReduxDevTools() ? [DevTools.instrument()] : []
  });

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers').default; // eslint-disable-line global-require
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
