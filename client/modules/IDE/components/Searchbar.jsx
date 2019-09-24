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
      this.props.setSearchTerm(this.state.searchValue);
    }
  }

  searchChange = (value) => {
    this.props.setSearchTerm(this.state.searchValue);
  };

  handleSearchChange = (e) => {
    this.setState({ searchValue: e.target.value }, () => {
      this.throttledSearchChange(this.state.searchValue);
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
          placeholder="Search sketches..."
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
  resetSearchTerm: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    searchTerm: state.search.searchTerm
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, SortingActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Searchbar);
