import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// import detector from 'i18next-browser-languagedetector';//
// import Fetch from 'i18next-fetch-backend';
// import Fetch from 'i18next-fetch-backend';
import Backend from 'i18next-http-backend';
// import axios from 'axios';
// import commonEn from './locales/en/translations.json';
// import commonEs from './locales/es/translations.json';

const fallbackLng = ['en'];
const availableLanguages = ['en', 'es'];
/* const fileTmp = '/locales/en/translations.json';
axios.get(fileTmp)
  .then((response) => {
    console.log('Datos que traere');
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
  }).catch((error) => {
  // handle error
    console.log('ERROR AXIOS ASA AXIOS');
    console.log(error);
  }); */


const options = {
  // loadPath: '/locales/{{lng}}/translations.json',
  loadPath: '/locales/{{lng}}/translations.json',
  // loadPath: fileTmp,
  requestOptions: { // used for fetch, can also be a function (payload) => ({ method: 'GET' })
    mode: 'no-cors'
  },
  allowMultiLoading: false, // set loadPath: '/locales/resources.json?lng={{lng}}&ns={{ns}}' to adapt to multiLoading
};

i18n
  .use(initReactI18next) // pass the i18n instance to react-i18next.
  .use(Backend).init({
    lng: 'en',
    defaultNS: 'menu',
    fallbackLng, // if user computer language is not on the list of available languages, than we will be using the fallback language specified earlier
    debug: true,
    backend: options,
    getAsync: false,
    initImmediate: false,
    useSuspense: true,
    whitelist: availableLanguages,
    interpolation: {
      escapeValue: false
    },
    saveMissing: true,
  });

export default i18n;
