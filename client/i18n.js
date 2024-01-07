import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

import {
  ar,
  be,
  da,
  el,
  enUS,
  es,
  ja,
  hi,
  id,
  it,
  ko,
  ptBR,
  ru,
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
  'ar',
  'be',
  'de',
  'el',
  'en-US',
  'es-419',
  'fr-CA',
  'hi',
  'id',
  'it',
  'ja',
  'ko',
  'nl',
  'pt-BR',
  'ru',
  'sv',
  'uk-UA',
  'zh-CN',
  'zh-TW',
  'tr',
  'ur'
];

export function languageKeyToLabel(lang) {
  const languageMap = {
    ar: 'العربية',
    be: 'বাংলা',
    de: 'Deutsch',
    el: 'Ελληνικά',
    'en-US': 'English',
    'es-419': 'Español',
    'fr-CA': 'Français',
    hi: 'हिन्दी',
    id: 'Bahasa Indonesia',
    it: 'Italiano',
    ja: '日本語',
    ko: '한국어',
    nl: 'Dutch',
    'pt-BR': 'Português',
    ru: 'Русский',
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
    ar,
    be,
    de,
    el,
    'en-US': enUS,
    'es-419': es,
    'fr-CA': frCA,
    hi,
    id,
    it,
    ja,
    ko,
    nl,
    'pt-BR': ptBR,
    ru,
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
