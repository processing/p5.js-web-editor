import { setSorting } from '../reducers/sorting';
import { setSearchTerm } from '../reducers/search';

export { toggleDirectionForField } from '../reducers/sorting';

export const DIRECTION = {
  ASC: 'ASCENDING',
  DESC: 'DESCENDING'
};

export function resetSorting() {
  return setSorting('createdAt', DIRECTION.DESC);
}

export function resetSearchTerm(scope) {
  return setSearchTerm(scope, '');
}
