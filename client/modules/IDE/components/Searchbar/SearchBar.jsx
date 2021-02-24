import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import i18next from 'i18next';
import SearchIcon from '../../../../images/magnifyingglass.svg';

class SearchBar extends React.Component {
  handleResetSearch = () => {
    this.props.onChangeSearchTerm('');
  };

  handleSearchChange = (e) => {
    this.props.onChangeSearchTerm(e.target.value);
  };

  render() {
    const { searchTerm } = this.props;
    return (
      <div
        className={`searchbar ${
          searchTerm === '' ? 'searchbar--is-empty' : ''
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
          value={this.props.searchTerm}
          placeholder={this.props.searchLabel}
          onChange={this.handleSearchChange}
        />
        <button
          className="searchbar__clear-button"
          onClick={this.handleResetSearch}
        >
          {this.props.t('Searchbar.ClearTerm')}
        </button>
      </div>
    );
  }
}

SearchBar.propTypes = {
  onChangeSearchTerm: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  searchLabel: PropTypes.string,
  t: PropTypes.func.isRequired
};

SearchBar.defaultProps = {
  searchLabel: i18next.t('Searchbar.SearchSketch')
};

export default withTranslation()(SearchBar);
