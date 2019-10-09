import * as ActionTypes from '../../../constants';

export const DIRECTION = {
  ASC: 'ASCENDING',
  DESC: 'DESCENDING'
};

export function setSorting(field, direction) {
  return {
    type: ActionTypes.SET_SORTING,
    payload: {
      field,
      direction
    }
  };
}

export function resetSorting() {
  return setSorting('createdAt', DIRECTION.DESC);
}

export function toggleDirectionForField(field) {
  return {
    type: ActionTypes.TOGGLE_DIRECTION,
    field
  };
}

export function setSearchTerm(searchTerm) {
  return {
    type: ActionTypes.SET_SEARCH_TERM,
    query: searchTerm
  };
}

export function resetSearchTerm() {
  return setSearchTerm('');
}
