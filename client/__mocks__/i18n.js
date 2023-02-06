import { enUS, es, ja, hi } from 'date-fns/locale';
import i18n from '../i18n-test';

export function languageKeyToLabel(lang) {
  const languageMap = {
    'en-US': 'English',
    'es-419': 'Español',
    ja: '日本語',
    hi: 'हिन्दी'
  };
  return languageMap[lang];
}

export function languageKeyToDateLocale(lang) {
  const languageMap = {
    'en-US': enUS,
    'es-419': es,
    ja,
    hi
  };
  return languageMap[lang];
}

export function currentDateLocale() {
  return languageKeyToDateLocale(i18n.language);
}

export default i18n;
