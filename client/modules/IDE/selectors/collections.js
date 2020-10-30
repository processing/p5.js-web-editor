import { createSelector } from 'reselect';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import { DIRECTION } from '../actions/sorting';

const getCollections = (state, id) => {
  if (id !== undefined) {
    return find(state.collections, { id });
  }
  return state.collections;
};
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
    console.log(collections);
    if (Array.isArray(collections)) {
      if (field === 'name') {
        if (direction === DIRECTION.DESC) {
          return orderBy(collections, 'name', 'desc');
        }
        return orderBy(collections, 'name', 'asc');
      } else if (field === 'numItems') {
        if (direction === DIRECTION.DESC) {
          return orderBy(collections, 'items.length', 'desc');
        }
        return orderBy(collections, 'items.length', 'asc');
      }
      const sortedCollections = [...collections].sort((a, b) => {
        const result =
          direction === DIRECTION.ASC
            ? differenceInMilliseconds(new Date(a[field]), new Date(b[field]))
            : differenceInMilliseconds(new Date(b[field]), new Date(a[field]));
        return result;
      });
      return sortedCollections;
    } else if (typeof collections === 'object') {
      if (field === 'name') {
        if (direction === DIRECTION.DESC) {
          return { ...collections, items: orderBy(collections.items, 'project.name', 'desc') };
        }
        return { ...collections, items: orderBy(collections.items, 'project.name', 'asc') };
      } else if (field === 'user') {
        if (direction === DIRECTION.DESC) {
          return { ...collections, items: orderBy(collections.items, 'project.user.username', 'desc') };
        }
        return { ...collections, items: orderBy(collections.items, 'project.user.username', 'asc') };
      }
      const sortedCollections = [...collections.items].sort((a, b) => {
        const result =
          direction === DIRECTION.ASC
            ? differenceInMilliseconds(new Date(a[field]), new Date(b[field]))
            : differenceInMilliseconds(new Date(b[field]), new Date(a[field]));
        return result;
      });
      return { ...collections, items: sortedCollections };
    }
    return collections;
  }
);
export default getSortedCollections;
