import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import { useTranslation } from 'react-i18next';
import SearchIcon from '../../../../images/magnifyingglass.svg';

const Searchbar = ({
  searchTerm,
  setSearchTerm,
  resetSearchTerm,
  searchLabel
}) => {
  const [searchValue, setSearchValue] = useState(searchTerm);
  const { t } = useTranslation(); // Use useTranslation to access t

  const searchChange = () => {
    setSearchTerm(searchValue.trim());
  };

  const throttledSearchChange = useMemo(() => throttle(searchChange, 500), [
    searchChange
  ]);

  useEffect(
    () => () => {
      resetSearchTerm();
    },
    [resetSearchTerm]
  );

  const handleResetSearch = () => {
    setSearchValue('');
    resetSearchTerm();
  };

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    throttledSearchChange(newValue.trim());
  };

  return (
    <div
      className={`searchbar ${searchValue === '' ? 'searchbar--is-empty' : ''}`}
    >
      <div className="searchbar__button">
        <SearchIcon
          className="searchbar__icon"
          focusable="false"
          aria-hidden="true"
        />
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
  searchLabel: PropTypes.string
};

Searchbar.defaultProps = {
  searchLabel: 'Default Search Label'
};

export default Searchbar;
