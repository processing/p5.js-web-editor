import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import DevTools from './modules/App/components/DevTools';
import rootReducer from './reducers';
import { clearState, loadState } from './persistState';
import getConfig from './utils/getConfig';

export default function configureStore(initialState) {
  const enhancers = [applyMiddleware(thunk)];

  if (getConfig('CLIENT') && getConfig('NODE_ENV') === 'development') {
    // Enable DevTools only when rendering on client and during development.
    enhancers.push(
      window.devToolsExtension
        ? window.devToolsExtension()
        : DevTools.instrument()
    );
  }

  const savedState = loadState();
  clearState();

  const store = createStore(
    rootReducer,
    savedState != null ? savedState : initialState,
    compose(...enhancers)
  );

  if (import.meta.webpackHot) {
    // Enable Webpack hot module replacement for reducers
    import.meta.webpackHot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers').default; // eslint-disable-line global-require
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
