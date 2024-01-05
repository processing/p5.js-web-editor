import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import { withTranslation } from 'react-i18next';
import i18next from 'i18next';
import SearchIcon from '../../../../images/magnifyingglass.svg';

const Searchbar = ({
  searchTerm,
  setSearchTerm,
  resetSearchTerm,
  searchLabel,
  t
}) => {
  const [searchValue, setSearchValue] = useState(searchTerm);

  const throttledSearchChange = useCallback(throttle(searchChange, 500), []);

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
      <button
        className="searchbar__clear-button"
        onClick={handleResetSearch}
      >
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
