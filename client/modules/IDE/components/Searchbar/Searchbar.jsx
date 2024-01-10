import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import { withTranslation } from 'react-i18next';
import i18next from 'i18next';
import SearchIcon from '../../../../images/magnifyingglass.svg';

const Searchbar = ({
  searchTerm,
  setSearchTerm,
  resetSearchTerm,
  searchLabel = i18next.t('Searchbar.SearchSketch'),
  t
}) => {
  const [searchValue, setSearchValue] = useState(searchTerm);
  const throttledSearchChange = throttle(() => {
    setSearchTerm(searchValue.trim());
  }, 500);

  useEffect(() => {
    return () => {
      resetSearchTerm();
    };
  }, [resetSearchTerm]);

  const handleResetSearch = () => {
    setSearchValue('');
    resetSearchTerm();
  };

  const searchChange = () => {
    setSearchTerm(searchValue.trim());
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    throttledSearchChange();
  };

  return (
    <div className={`searchbar ${searchValue === '' ? 'searchbar--is-empty' : ''}`}>
      <div className="searchbar__button">
        <SearchIcon className="searchbar__icon" focusable="false" aria-hidden="true" />
      </div>
      <input
        className="searchbar__input"
        type="text"
        value={searchValue}
        placeholder={searchLabel}
        onChange={handleSearchChange}
      />
      <button className="searchbar__clear-button" onClick={handleResetSearch}>
        {t('Searchbar.ClearTerm')}
      </button>
    </div>
  );
};

Searchbar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  resetSearchTerm: PropTypes.func.isRequired,
  searchLabel: PropTypes.string,
  t: PropTypes.func.isRequired
};

Searchbar.defaultProps = {
  searchLabel: i18next.t('Searchbar.SearchSketch')
};

export default withTranslation()(Searchbar);