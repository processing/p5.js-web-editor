import find from 'lodash/find';

const getCollections = (state) => state.collections;

export default function getCollection(state, id) {
  return find(getCollections(state), { id });
}
