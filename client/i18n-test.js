import i18n from 'i18next';
import translationEnglish from '../translations/locales/en-US/translations.json';

i18n
  .init({
    fallbackLng: 'en',
    lng: 'en-US',
    ns: ['translations'],
    defaultNS: ['translations'],
    debug: false,
    saveMissing: false,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    resources: {
      en: {
        translations: translationEnglish
      }
    },
    react: {
      wait: false,
      nsMode: 'fallback'
    }
  });
export default i18n;
