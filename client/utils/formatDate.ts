import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import format from 'date-fns/format';
import isValid from 'date-fns/isValid';
import parseISO from 'date-fns/parseISO';
import i18next from 'i18next';
import { currentDateLocale } from '../i18n';

/**
 * Parses input into a valid Date object, or returns null if invalid.
 * @param date - Date or string to parse
 * @returns Parsed Date or null
 */
function parse(maybeDate: Date | string) {
  const date = maybeDate instanceof Date ? maybeDate : parseISO(maybeDate);

  if (isValid(date)) {
    return date;
  }

  return null;
}

/**
 * Returns a human-friendly relative time string from now.
 * For very recent dates, returns specific labels (e.g., 'JustNow').
 * @param date - Date or string to compare
 * @returns Relative time string or empty string if invalid
 */
export function distanceInWordsToNow(date: Date | string) {
  const parsed = parse(date);

  if (!parsed) return '';

  const diffInMs = Math.abs(differenceInMilliseconds(new Date(), parsed));

  if (diffInMs < 10000) return i18next.t('formatDate.JustNow');
  if (diffInMs < 20000) return i18next.t('formatDate.15Seconds');
  if (diffInMs < 30000) return i18next.t('formatDate.25Seconds');
  if (diffInMs < 46000) return i18next.t('formatDate.35Seconds');

  const timeAgo = formatDistanceToNow(parsed, {
    includeSeconds: false,
    locale: currentDateLocale()
  });

  return i18next.t('formatDate.Ago', { timeAgo });
}

/**
 * Formats a date as a string. Includes time by default.
 * @param date - Date or string to format
 * @param options - Formatting options
 * @param options.showTime - Whether to include time (default true)
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateToString(
  date: Date | string,
  { showTime = true } = {}
): string {
  const parsed = parse(date);
  if (!parsed) return '';

  const formatType = showTime ? 'PPpp' : 'PP';
  return format(parsed, formatType, { locale: currentDateLocale() });
}
