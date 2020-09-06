import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';
import format from 'date-fns/format';
import isValid from 'date-fns/is_valid';
import parseISO from 'date-fns/parse';
import i18next from 'i18next';

function parse(maybeDate) {
  const date = maybeDate instanceof Date ? maybeDate : parseISO(maybeDate);

  if (isValid(date)) {
    return date;
  }

  return null;
}

export default {
  distanceInWordsToNow(date) {
    const parsed = parse(date);

    if (parsed) {
      const now = new Date();
      const diffInMs = differenceInMilliseconds(now, parsed);

      if (Math.abs(diffInMs < 10000)) {
        return i18next.t('formatDate.JustNow');
      } else if (diffInMs < 20000) {
        return i18next.t('formatDate.15Seconds');
      } else if (diffInMs < 30000) {
        return i18next.t('formatDate.25Seconds');
      } else if (diffInMs < 46000) {
        return i18next.t('formatDate.35Seconds');
      }

      const timeAgo = distanceInWordsToNow(parsed, {
        includeSeconds: true
      });
      return i18next.t('formatDate.Ago', { timeAgo });
    }

    return '';
  },
  format(date, { showTime = true } = {}) {
    const parsed = parse(date);
    const formatType = showTime ? 'MMM D, YYYY h:mm A' : 'MMM D, YYYY';

    if (parsed) {
      return format(parsed, formatType);
    }

    return '';
  }
};
