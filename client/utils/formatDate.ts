  import formatDistanceToNow from 'date-fns/formatDistanceToNow';
  import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
  import format from 'date-fns/format';
  import isValid from 'date-fns/isValid';
  import parseISO from 'date-fns/parseISO';
  import i18next from 'i18next';
  import { currentDateLocale } from '../i18n';

type DateInput = string | Date;

interface FormatOptions {
  showTime?: boolean;
}

function parse(maybeDate: DateInput): Date | null {
  const date = maybeDate instanceof Date ? maybeDate : parseISO(maybeDate);

  if (isValid(date)) {
    return date;
  }
  return null;
}

export default {
  distanceInWordsToNow(date: DateInput): string {
    const parsed = parse(date);

    if (parsed) {
      const now = new Date();
      const diffInMs = differenceInMilliseconds(now, parsed);

      if (Math.abs(diffInMs) < 10000) {
        return i18next.t('formatDate.JustNow');
      } else if (diffInMs < 20000) {
        return i18next.t('formatDate.15Seconds');
      } else if (diffInMs < 30000) {
        return i18next.t('formatDate.25Seconds');
      } else if (diffInMs < 46000) {
        return i18next.t('formatDate.35Seconds');
      }

      const timeAgo = formatDistanceToNow(parsed, {
        includeSeconds: false,
        locale: currentDateLocale(),
      });
      return i18next.t('formatDate.Ago', { timeAgo });
    }
    return '';
  },

  format(date: DateInput, options: FormatOptions = { showTime: true }): string {
    const parsed = parse(date);
    const formatType = options.showTime ? 'PPpp' : 'PP';

    if (parsed) {
      return format(parsed, formatType, { locale: currentDateLocale() });
    }
    return '';
  },
};  