import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

const fallbackLng = ['en'];
const availableLanguages = ['en', 'es'];

const options = {
  loadPath: '/translations/{{lng}}/translations.json',
  requestOptions: { // used for fetch, can also be a function (payload) => ({ method: 'GET' })
    mode: 'no-cors'
  },
  allowMultiLoading: false, // set loadPath: '/locales/resources.json?lng={{lng}}&ns={{ns}}' to adapt to multiLoading
};

i18n
  .use(initReactI18next) // pass the i18n instance to react-i18next.
  .use(Backend).init({
    lng: 'en',
    defaultNS: 'WebEditor',
    fallbackLng, // if user computer language is not on the list of available languages, than we will be using the fallback language specified earlier
    debug: true,
    backend: options,
    getAsync: false,
    initImmediate: false,
    useSuspense: true,
    whitelist: availableLanguages,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    saveMissing: true,
  });

export default i18n;
