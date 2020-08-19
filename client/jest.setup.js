import '@babel/polyfill';

// See: https://github.com/testing-library/jest-dom
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';

import lodash from 'lodash';

// For testing, we use en-US and provide a mock implementation
// of t() that finds the correct translation
import translations from '../translations/locales/en-US/translations.json';

// This function name needs to be prefixed with "mock" so that Jest doesn't
// complain that it's out-of-scope in the mock below
const mockTranslate = key => lodash.get(translations, key);

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate HoC receive the t function as a prop
  withTranslation: () => (Component) => {
    Component.defaultProps = { ...Component.defaultProps, t: mockTranslate };
    return Component;
  },
}));
