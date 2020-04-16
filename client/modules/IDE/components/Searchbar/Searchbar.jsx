import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';
import { throttle } from 'lodash';

const searchIcon = require('../../../../images/magnifyingglass.svg');

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
  }

  handleSearchEnter = (e) => {
    if (e.key === 'Enter') {
      this.searchChange();
    }
  }

  searchChange = () => {
    if (this.state.searchValue.trim().length === 0) return;
    this.props.setSearchTerm(this.state.searchValue.trim());
  };

  handleSearchChange = (e) => {
    this.setState({ searchValue: e.target.value }, () => {
      this.throttledSearchChange(this.state.searchValue);
    });
  }

  render() {
    const { searchValue } = this.state;
    return (
      <div className={`searchbar ${searchValue === '' ? 'searchbar--is-empty' : ''}`}>
        <div className="searchbar__button">
          <InlineSVG className="searchbar__icon" src={searchIcon} />
        </div>
        <input
          className="searchbar__input"
          type="text"
          value={searchValue}
          placeholder={this.props.searchLabel}
          onChange={this.handleSearchChange}
          onKeyUp={this.handleSearchEnter}
        />
        <button
          className="searchbar__clear-button"
          onClick={this.handleResetSearch}
        >clear
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
};

Searchbar.defaultProps = {
  searchLabel: 'Search sketches...',
};

export default Searchbar;
