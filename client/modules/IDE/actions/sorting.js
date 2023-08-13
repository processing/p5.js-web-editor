import * as ActionTypes from '../../../constants';

export const DIRECTION = {
  ASC: 'ASCENDING',
  DESC: 'DESCENDING'
};

export function setSearchTerm(scope, searchTerm) {
  return {
    type: ActionTypes.SET_SEARCH_TERM,
    query: searchTerm,
    scope
  };
}

export function resetSearchTerm(scope) {
  return setSearchTerm(scope, '');
}
