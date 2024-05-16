import * as ActionTypes from '../../../constants';
import { sortingActions } from '../reducers/sorting';

export const { toggleDirection, setSorting } = sortingActions;

export const DIRECTION = {
  ASC: 'ASCENDING',
  DESC: 'DESCENDING'
};

export function resetSorting() {
  return setSorting('createdAt', DIRECTION.DESC);
}

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
