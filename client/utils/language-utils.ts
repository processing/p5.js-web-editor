/**
 * Utility functions for language detection and handling
 */

export function getPreferredLanguage(
  supportedLanguages: string[] = [],
  defaultLanguage: string = 'en'
): string | undefined {
  const { navigator } = window;

  if (!navigator) {
    return defaultLanguage;
  }

  const normalizeLanguage = (langCode: string) => langCode.toLowerCase().trim();
  const normalizedSupported = supportedLanguages.map(normalizeLanguage);

  /**
   * Attempts to find a match in normalizedSupported given a browser-provided language.
   * Prioritizes exact match of both language and region (eg. 'en-GB'), falls back to base-language match (eg. 'en').
   */
  function findMatch(inputLang: string): string | undefined {
    const normalizedLang = normalizeLanguage(inputLang);

    const exactMatchIndex = normalizedSupported.indexOf(normalizedLang);
    if (exactMatchIndex !== -1) return supportedLanguages[exactMatchIndex];

    const baseLanguage = normalizedLang.split('-')[0];
    const partialMatchIndex = normalizedSupported.findIndex(
      (lang) => lang === baseLanguage || lang.startsWith(`${baseLanguage}-`)
    );
    if (partialMatchIndex !== -1) return supportedLanguages[partialMatchIndex];

    // eslint-disable-next-line consistent-return
    return undefined;
  }

  // Try navigator.languages list first
  if (Array.isArray(navigator.languages)) {
    for (let i = 0; i < navigator.languages.length; i++) {
      const match = findMatch(navigator.languages[i]);
      if (match) return match;
    }
  }

  // Fallback to navigator.language
  if (navigator.language) {
    const match = findMatch(navigator.language);
    if (match) return match;
  }

  return defaultLanguage;
}
