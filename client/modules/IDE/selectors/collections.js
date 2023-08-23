import { createSelector } from 'reselect';
import find from 'lodash/find';

const getCollections = (state) => state.collections;
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

export function getCollection(state, id) {
  return find(getCollections(state), { id });
}

export default getFilteredCollections;
