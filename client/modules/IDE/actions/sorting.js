import * as ActionTypes from '../../../constants';
import { setSorting } from '../reducers/sorting';

export { toggleDirectionForField } from '../reducers/sorting';

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
