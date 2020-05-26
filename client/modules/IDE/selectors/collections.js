import { createSelector } from 'reselect';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import { DIRECTION } from '../actions/sorting';

const getCollections = state => state.collections;
const getField = state => state.sorting.field;
const getDirection = state => state.sorting.direction;
const getSearchTerm = state => state.search.collectionSearchTerm;

const getFilteredCollections = createSelector(
  getCollections,
  getSearchTerm,
  (collections, search) => {
    if (search) {
      const searchStrings = collections.map((collection) => {
        const smallCollection = {
          name: collection.name
        };
        return { ...collection, searchString: Object.values(smallCollection).join(' ').toLowerCase() };
      });
      return searchStrings.filter(collection => collection.searchString.includes(search.toLowerCase()));
    }
    return collections;
  }
);


const getSortedCollections = createSelector(
  getFilteredCollections,
  getField,
  getDirection,
  (collections, field, direction) => {
    if (field === 'name') {
      if (direction === DIRECTION.DESC) {
        return orderBy(collections, 'name', 'desc');
      }
      return orderBy(collections, 'name', 'asc');
    }
    const sortedCollections = [...collections].sort((a, b) => {
      const result =
        direction === DIRECTION.ASC
          ? differenceInMilliseconds(new Date(a[field]), new Date(b[field]))
          : differenceInMilliseconds(new Date(b[field]), new Date(a[field]));
      return result;
    });
    return sortedCollections;
  }
);

export function getCollection(state, id) {
  return find(getCollections(state), { id });
}

export default getSortedCollections;
