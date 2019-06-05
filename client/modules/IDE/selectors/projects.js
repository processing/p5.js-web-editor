import { createSelector } from 'reselect';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';
import sortBy from 'lodash/sortBy';
import reverse from 'lodash/reverse';
import { DIRECTION } from '../actions/sorting';

const getSketches = state => state.sketches;
const getField = state => state.sorting.field;
const getDirection = state => state.sorting.direction;

const getSortedSketches = createSelector(
  getSketches,
  getField,
  getDirection,
  (sketches, field, direction) => {
    if (field === 'name') {
      const sortedSketches = sortBy(sketches, 'name');
      if (direction === DIRECTION.DESC) {
        return reverse(sortedSketches);
      }
      return sortedSketches;
    }
    const sortedSketches = [...sketches].sort((a, b) => {
      const result =
        direction === DIRECTION.ASC
          ? differenceInMilliseconds(new Date(a[field]), new Date(b[field]))
          : differenceInMilliseconds(new Date(b[field]), new Date(a[field]));
      return result;
    });
    return sortedSketches;
  }
);

export default getSortedSketches;
