import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import SearchIcon from '../../../../images/magnifyingglass.svg';

const Searchbar = ({
  searchTerm,
  setSearchTerm,
  resetSearchTerm,
  searchLabel
}) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState(searchTerm);

  const throttledSearchChange = useCallback(
    throttle((value) => {
      setSearchTerm(value.trim());
    }, 500),
    [setSearchTerm]
  );

  const handleResetSearch = () => {
    setSearchValue('');
    resetSearchTerm();
  };

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchValue(value);
    throttledSearchChange(value.trim());
  };

  useEffect(() => {
    setSearchValue(searchTerm);
  }, [searchTerm]);

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
  searchLabel: i18next.t('Searchbar.SearchSketch')
};

export default Searchbar;
