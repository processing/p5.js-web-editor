import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

import {
  be,
  enUS,
  es,
  ja,
  hi,
  it,
  ko,
  ptBR,
  de,
  frCA,
  zhCN,
  zhTW,
  uk,
  sv,
  tr,
  enIN
} from 'date-fns/locale';

const fallbackLng = ['en-US'];

export const availableLanguages = [
  'be',
  'de',
  'en-US',
  'es-419',
  'fr-CA',
  'hi',
  'it',
  'ja',
  'ko',
  'pt-BR',
  'sv',
  'uk-UA',
  'zh-CN',
  'zh-TW',
  'tr',
  'ur'
];

export function languageKeyToLabel(lang) {
  const languageMap = {
    be: 'বাংলা',
    de: 'Deutsch',
    'en-US': 'English',
    'es-419': 'Español',
    'fr-CA': 'Français',
    hi: 'हिन्दी',
    it: 'Italiano',
    ja: '日本語',
    ko: '한국어',
    'pt-BR': 'Português',
    sv: 'Svenska',
    'uk-UA': 'Українська',
    'zh-CN': '简体中文',
    'zh-TW': '正體中文',
    tr: 'Türkçe',
    ur: 'اردو'
  };
  return languageMap[lang];
}

export function languageKeyToDateLocale(lang) {
  const languageMap = {
    be,
    de,
    'en-US': enUS,
    'es-419': es,
    'fr-CA': frCA,
    hi,
    it,
    ja,
    ko,
    'pt-BR': ptBR,
    sv,
    'uk-UA': uk,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    tr,
    ur: enIN
  };
  return languageMap[lang];
}

export function currentDateLocale() {
  return languageKeyToDateLocale(i18n.language);
}

const options = {
  loadPath: '/locales/{{lng}}/translations.json',
  requestOptions: {
    // used for fetch, can also be a function (payload) => ({ method: 'GET' })
    mode: 'no-cors'
  },
  allowMultiLoading: false // set loadPath: '/locales/resources.json?lng={{lng}}&ns={{ns}}' to adapt to multiLoading
};

i18n
  .use(initReactI18next) // pass the i18n instance to react-i18next.
  // .use(LanguageDetector)// to detect the language from currentBrowser
  .use(Backend) // to fetch the data from server
  .init({
    lng: 'en-US',
    fallbackLng, // if user computer language is not on the list of available languages, than we will be using the fallback language specified earlier
    debug: false,
    backend: options,
    getAsync: false,
    initImmediate: false,
    useSuspense: true,
    whitelist: availableLanguages,
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    saveMissing: false, // if a key is not found AND this flag is set to true, i18next will call the handler missingKeyHandler
    missingKeyHandler: false // function(lng, ns, key, fallbackValue) { }  custom logic about how to handle the missing keys
  });

export default i18n;
