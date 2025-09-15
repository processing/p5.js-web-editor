import { getPreferredLanguage } from './language-utils';

describe('getPreferredLanguage', () => {
  const originalNavigator = window.navigator;

  afterEach(() => {
    window.navigator = originalNavigator;
  });

  const mockNavigator = (language: string, languages: string[] = []) => {
    window.navigator = {
      ...originalNavigator,
      language,
      languages
    };
  };

  describe('when navigator is undefined', () => {
    it('returns the default language', () => {
      const oldNavigator = window.navigator;

      // @ts-expect-error TS2790: The operand of a 'delete' operator must be optional
      delete window.navigator;

      const result = getPreferredLanguage(['en', 'fr'], 'en');
      expect(result).toBe('en');

      window.navigator = oldNavigator;
    });
  });

  describe('when navigator.languages has an exact match', () => {
    it('returns the first matching language from the navigator.languages list', () => {
      mockNavigator('en-US', ['en-GB', 'fr-FR', 'cz-CZ']);
      const result = getPreferredLanguage(['fr-FR', 'es-SP', 'en-GB'], 'en');
      expect(result).toBe('en-GB');
    });
  });

  describe('when navigator.languages has a partial match', () => {
    it('returns the base language match', () => {
      mockNavigator('en-US', ['en-GB', 'fr-FR', 'cz-CZ', 'es-SP']);
      const result = getPreferredLanguage(['de', 'fr'], 'en');
      expect(result).toBe('fr');
    });
  });

  describe('when only navigator.language is available', () => {
    it('returns exact match if found', () => {
      mockNavigator('fr-FR', []);
      const result = getPreferredLanguage(['fr-FR', 'de'], 'en');
      expect(result).toBe('fr-FR');
    });

    it('returns partial match if found', () => {
      mockNavigator('de-DE', []);
      const result = getPreferredLanguage(['de', 'fr'], 'en');
      expect(result).toBe('de');
    });

    it('returns the default if no match is found', () => {
      mockNavigator('es-MX', []);
      const result = getPreferredLanguage(['fr', 'de'], 'en');
      expect(result).toBe('en');
    });
  });

  describe('language normalization', () => {
    it('handles casing and whitespace differences', () => {
      mockNavigator(' EN-us ', [' EN ', ' FR ']);
      const result = getPreferredLanguage(['fr', 'en'], 'de');
      expect(result).toBe('en');
    });
  });
});
