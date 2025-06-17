/**
 * Utility functions for language detection and handling
 */

function getPreferredLanguage(supportedLanguages = [], defaultLanguage = 'en') {
  if (typeof navigator === 'undefined') {
    return defaultLanguage;
  }

  const normalizeLanguage = (langCode) => langCode.toLowerCase().trim();

  const normalizedSupported = supportedLanguages.map(normalizeLanguage);

  if (navigator.languages && navigator.languages.length) {
    const matchedLang = navigator.languages.find((browserLang) => {
      const normalizedBrowserLang = normalizeLanguage(browserLang);

      const hasExactMatch =
        normalizedSupported.findIndex(
          (lang) => lang === normalizedBrowserLang
        ) !== -1;

      if (hasExactMatch) {
        return true;
      }

      const languageOnly = normalizedBrowserLang.split('-')[0];
      const hasLanguageOnlyMatch =
        normalizedSupported.findIndex(
          (lang) => lang === languageOnly || lang.startsWith(`${languageOnly}-`)
        ) !== -1;

      return hasLanguageOnlyMatch;
    });

    if (matchedLang) {
      const normalizedMatchedLang = normalizeLanguage(matchedLang);
      const exactMatchIndex = normalizedSupported.findIndex(
        (lang) => lang === normalizedMatchedLang
      );

      if (exactMatchIndex !== -1) {
        return supportedLanguages[exactMatchIndex];
      }

      const languageOnly = normalizedMatchedLang.split('-')[0];
      const languageOnlyMatchIndex = normalizedSupported.findIndex(
        (lang) => lang === languageOnly || lang.startsWith(`${languageOnly}-`)
      );

      if (languageOnlyMatchIndex !== -1) {
        return supportedLanguages[languageOnlyMatchIndex];
      }
    }
  }

  if (navigator.language) {
    const normalizedNavLang = normalizeLanguage(navigator.language);
    const exactMatchIndex = normalizedSupported.findIndex(
      (lang) => lang === normalizedNavLang
    );

    if (exactMatchIndex !== -1) {
      return supportedLanguages[exactMatchIndex];
    }

    const languageOnly = normalizedNavLang.split('-')[0];
    const languageOnlyMatchIndex = normalizedSupported.findIndex(
      (lang) => lang === languageOnly || lang.startsWith(`${languageOnly}-`)
    );

    if (languageOnlyMatchIndex !== -1) {
      return supportedLanguages[languageOnlyMatchIndex];
    }
  }

  return defaultLanguage;
}

export default getPreferredLanguage;
