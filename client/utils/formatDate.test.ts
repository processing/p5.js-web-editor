import i18next from 'i18next';
import { distanceInWordsToNow, formatDateToString } from './formatDate';

jest.mock('i18next', () => ({
  t: jest.fn((key: string) => key.split('.')[1])
}));

jest.mock('../i18n', () => ({
  // eslint-disable-next-line global-require
  currentDateLocale: () => require('date-fns/locale').enUS
}));

describe('dateUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('distanceInWordsToNow', () => {
    it('returns "JustNow" for dates within 10 seconds', () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 5000);

      const result = distanceInWordsToNow(recentDate);
      expect(i18next.t).toHaveBeenCalledWith('formatDate.JustNow');
      expect(result).toBe('JustNow');
    });

    it('returns "15Seconds" for dates ~15s ago', () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 15000);

      const result = distanceInWordsToNow(recentDate);
      expect(i18next.t).toHaveBeenCalledWith('formatDate.15Seconds');
      expect(result).toBe('15Seconds');
    });

    it('returns formatted distance with "Ago" for dates over 46s', () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 60000);

      jest.mock('i18next', () => ({
        t: jest.fn((key: string, { timeAgo }) => `${key}: ${timeAgo}`)
      }));

      const result = distanceInWordsToNow(oldDate);
      expect(i18next.t).toHaveBeenCalledWith(
        'formatDate.Ago',
        expect.any(Object)
      );
      expect(result).toContain('Ago');
    });

    it('returns empty string for invalid date', () => {
      const result = distanceInWordsToNow('not a date');
      expect(result).toBe('');
    });
  });

  describe('format', () => {
    it('formats with time by default', () => {
      const date = new Date('2025-07-16T12:34:56Z');
      const formatted = formatDateToString(date);

      expect(formatted).toMatch(/(\d{1,2}:\d{2})/); // Contains time
    });

    it('formats without time when showTime is false', () => {
      const date = new Date('2025-07-16T12:34:56Z');
      const formatted = formatDateToString(date, { showTime: false });

      expect(formatted).not.toMatch(/(\d{1,2}:\d{2})/); // Contains time
    });

    it('returns empty string for invalid date', () => {
      const formatted = formatDateToString('invalid date');
      expect(formatted).toBe('');
    });
  });
});
