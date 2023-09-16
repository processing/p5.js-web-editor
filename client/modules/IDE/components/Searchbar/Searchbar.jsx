import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import { throttle } from 'lodash';
import { withTranslation } from 'react-i18next';
import i18next from 'i18next';
import SearchIcon from '../../../../images/magnifyingglass.svg';

function Searchbar(props) {
  const [searchValue, setSearchValue] = useState(props.searchTerm);

  useEffect(() => {
    return () => {
      props.resetSearchTerm();
    };
  }, []);

  const handleResetSearch = () => {
    setSearchValue('');
    props.resetSearchTerm();
  };

  const throttledSearchChange = useCallback(
    throttle((value) => {
      props.setSearchTerm(value.trim());
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    throttledSearchChange(newValue);
  };

  return (
    <div
      className={`searchbar ${
        searchValue === '' ? 'searchbar--is-empty' : ''
      }`}
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
        placeholder={props.searchLabel}
        onChange={handleSearchChange}
      />
      <button
        className="searchbar__clear-button"
        onClick={handleResetSearch}
      >
        {props.t('Searchbar.ClearTerm')}
      </button>
    </div>
  );
}

Searchbar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  resetSearchTerm: PropTypes.func.isRequired,
  searchLabel: PropTypes.string,
  t: PropTypes.func.isRequired,
};

Searchbar.defaultProps = {
  searchLabel: i18next.t('Searchbar.SearchSketch'),
};

export default withTranslation()(Searchbar);