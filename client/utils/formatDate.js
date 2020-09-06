import format from 'date-fns/format';
import isValid from 'date-fns/is_valid';
import parseISO from 'date-fns/parse';

function parse(maybeDate) {
  const date = maybeDate instanceof Date ? maybeDate : parseISO(maybeDate);

  if (isValid(date)) {
    return date;
  }

  return null;
}

export default {
  format(date, { showTime = true } = {}) {
    const parsed = parse(date);
    const formatType = showTime ? 'MMM D, YYYY h:mm A' : 'MMM D, YYYY';

    if (parsed) {
      return format(parsed, formatType);
    }

    return '';
  }
};
