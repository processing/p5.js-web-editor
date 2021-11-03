import PropTypes from 'prop-types';
import React from 'react';
import { throttle } from 'lodash';
import { withTranslation } from 'react-i18next';
import i18next from 'i18next';
import SearchIcon from '../../../../images/magnifyingglass.svg';

class Searchbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: this.props.searchTerm
    };
    this.throttledSearchChange = throttle(this.searchChange, 500);
  }

  componentWillUnmount() {
    this.props.resetSearchTerm();
  }

  handleResetSearch = () => {
    this.setState({ searchValue: '' }, () => {
      this.props.resetSearchTerm();
    });
  };

  searchChange = () => {
    this.props.setSearchTerm(this.state.searchValue.trim());
  };

  handleSearchChange = (e) => {
    this.setState({ searchValue: e.target.value }, () => {
      this.throttledSearchChange(this.state.searchValue.trim());
    });
  };

  render() {
    const { searchValue } = this.state;
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
