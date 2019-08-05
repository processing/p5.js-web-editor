import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { throttle } from 'lodash';
import * as SortingActions from '../actions/sorting';

const searchIcon = require('../../../images/magnifyingglass.svg');

class Searchbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: this.props.searchTerm
    };
    this.handleSearchEnter = this.handleSearchEnter.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.throttledSearchChange = throttle(this.throttledSearchChange.bind(this), 100);
  }

  handleResetSearch = () => {
    this.setState({ searchValue: '' }, () => {
      this.props.resetSearching();
    });
  }

  handleSearchEnter = (e) => {
    if (e.key === 'Enter') {
      this.props.searching(this.state.searchValue);
    }
  }

  handleSearchChange = (e) => {
    this.throttledSearchChange(e.target.value);
  }

  throttledSearchChange = (value) => {
    this.setState({ searchValue: value }, () => {
      this.props.searching(this.state.searchValue);
    });
  }
  render() {
    const { searchValue } = this.state;
    return (
      <div className="searchbar">
        <button
          type="submit"
          className="searchbar__button"
          onClick={this.handleSearchEnter}
        >
          <InlineSVG className="searchbar__icon" src={searchIcon} />
        </button>
        <input
          className="searchbar__input"
          type="text"
          value={searchValue}
          placeholder="Search files..."
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
  searching: PropTypes.func.isRequired,
  resetSearching: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    searchTerm: state.searching.searchTerm
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, SortingActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Searchbar);
