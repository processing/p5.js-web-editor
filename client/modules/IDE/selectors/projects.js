import { createSelector } from 'reselect';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import orderBy from 'lodash/orderBy';
import { DIRECTION } from '../actions/sorting';

const getSketches = state => state.sketches;
const getField = state => state.sorting.field;
const getDirection = state => state.sorting.direction;
const getSearchTerm = state => state.search.sketchSearchTerm;

const getFilteredSketches = createSelector(
  getSketches,
  getSearchTerm,
  (sketches, search) => {
    if (search) {
      const searchStrings = sketches.map((sketch) => {
        const smallSketch = {
          name: sketch.name
        };
        return { ...sketch, searchString: Object.values(smallSketch).join(' ').toLowerCase() };
      });
      return searchStrings.filter(sketch => sketch.searchString.includes(search.toLowerCase()));
    }
    return sketches;
  }
);

const getSortedSketches = createSelector(
  getFilteredSketches,
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
