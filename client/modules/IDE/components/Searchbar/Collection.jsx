import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import i18next from 'i18next';
import * as SortingActions from '../../actions/sorting';

import Searchbar from './Searchbar';

const scope = 'collection';

const SearchbarContainer = () => {
  const dispatch = useDispatch();
  const searchLabel = i18next.t('Searchbar.SearchCollection');
  const searchTerm = useSelector((state) => state.search[`${scope}SearchTerm`]);

  const setSearchTerm = (term) => {
    dispatch(SortingActions.setSearchTerm(scope, term));
  };

  const resetSearchTerm = () => {
    dispatch(SortingActions.resetSearchTerm(scope));
  };

  return (
    <Searchbar
      searchLabel={searchLabel}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      resetSearchTerm={resetSearchTerm}
    />
  );
};

export default SearchbarContainer;
