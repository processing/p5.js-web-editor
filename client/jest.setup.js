// eslint-disable-next-line import/no-extraneous-dependencies
import 'jest-styled-components';
import 'regenerator-runtime/runtime';

// See: https://github.com/testing-library/jest-dom
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  // Use .join() to check the entire message content regardless of how React formats it
  const fullMessage = args.join(' ');

  if (
    fullMessage.includes(
      'The prop `component` is marked as required in `Route`'
    )
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const fullMessage = args.join(' ');

  if (
    fullMessage.includes('has been renamed') ||
    fullMessage.includes('SideEffect(NullComponent)') ||
    fullMessage.includes('Duplicate schema index')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};
