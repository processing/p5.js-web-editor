// eslint-disable-next-line import/no-extraneous-dependencies
import 'jest-styled-components';
import 'regenerator-runtime/runtime';

// See: https://github.com/testing-library/jest-dom
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';

// Mock matchMedia
window.matchMedia = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // Deprecated
  removeListener: jest.fn(), // Deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}));

// Mock localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});
