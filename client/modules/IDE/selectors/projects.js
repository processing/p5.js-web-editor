import { createSelector } from 'reselect';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';
import orderBy from 'lodash/orderBy';
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
      if (direction === DIRECTION.DESC) {
        return orderBy(sketches, 'name', 'desc');
      }
      return orderBy(sketches, 'name', 'asc');
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
