import { createSelector } from '@reduxjs/toolkit';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import { find, orderBy } from 'lodash';
import { DIRECTION } from '../actions/sorting';

const getCollections = (state) => state.collections;
const getField = (state) => state.sorting.field;
const getDirection = (state) => state.sorting.direction;
const getSearchTerm = (state) => state.search.collectionSearchTerm;

const getFilteredCollections = createSelector(
  getCollections,
  getSearchTerm,
  (collections, search) => {
    if (search) {
      const searchStrings = collections.map((collection) => {
        const smallCollection = {
          name: collection.name
        };
        return {
          ...collection,
          searchString: Object.values(smallCollection).join(' ').toLowerCase()
        };
      });
      return searchStrings.filter((collection) =>
        collection.searchString.includes(search.toLowerCase())
      );
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
  }
);

export function getCollection(state, id) {
  const collection = find(getCollections(state), { id });
  const item = collection.items;
  const field = getField(state);
  const direction = getDirection(state);
  let sorted = [];
  console.log(field);
  if (item) {
    if (field === 'name') {
      console.log(direction === DIRECTION.DESC);
      if (direction === DIRECTION.DESC) {
        sorted = orderBy(item, 'project.name', 'desc');
      } else {
        sorted = orderBy(item, 'project.name', 'asc');
      }
    } else if (field === 'createdAt') {
      sorted = [...item].sort((a, b) => {
        const result =
          direction === DIRECTION.ASC
            ? differenceInMilliseconds(new Date(a[field]), new Date(b[field]))
            : differenceInMilliseconds(new Date(b[field]), new Date(a[field]));
        return result;
      });
    }
  }
  collection.items = sorted;
  return collection;
}

export default getSortedCollections;
