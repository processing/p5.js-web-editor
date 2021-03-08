import PropTypes from 'prop-types';
import React from 'react';
import { throttle } from 'lodash';
import { withTranslation } from 'react-i18next';
import i18next from 'i18next';
import styled from 'styled-components';
import { remSize, prop } from '../../../../theme';
import SearchIcon from '../../../../images/magnifyingglass.svg';

const SearchBarWrapper = styled.div`
  position: relative;
  display: flex;
`;

const SearchBarButton = styled.div`
  background-color: unset;
  width: ${remSize(31)};
  height: ${remSize(36)};
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  border: 0;
  border-right: solid 1px;
  border-color: ${prop('Input.borderColor')};
`;

const SearchBarInput = styled.input`
  width: ${remSize(240)};
  height: ${remSize(36)};
  border: solid 0.5px;
  padding-left: ${remSize(36)};
  padding-right: ${remSize(38)};
  border-color: ${prop('Input.borderColor')};
  background-color: ${prop('Input.background')};
`;

const SearchBarIcon = styled(SearchIcon)`
  display: inline-block;
  /* & svg {
    width: ${remSize(22)};
    height: ${remSize(27)};
    transform: scaleX(-1);
    padding-top: ${remSize(3)};
  } */
  & path {
    fill: ${prop('Input.textColor')};
  }
`;

const SearchBarClearButton = styled.button`
  font-weight: bold;
  font-size: ${remSize(10)};
  text-align: center;
  border-radius: 2px;
  align-self: center;
  position: absolute;
  padding: ${remSize(3)} ${remSize(4)};
  right: ${remSize(7)};
  color: ${prop('primaryTextColor')}!important;
  background-color: ${prop('Search.clearBackgroundColor')};
  display: ${(props) => (props.isVisible ? '' : 'none')};
  &:hover,
  &:focus {
    color: ${prop('Search.hover.textColor')};
    background-color: ${prop('Search.hover.backgroundColor')};
  }
`;

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
      <SearchBarWrapper
        className={`searchbar ${
          searchValue === '' ? 'searchbar--is-empty' : ''
        }`}
      >
        <SearchBarButton>
          <SearchBarIcon focusable="false" aria-hidden="true" />
        </SearchBarButton>
        <SearchBarInput
          type="text"
          value={searchValue}
          placeholder={this.props.searchLabel}
          onChange={this.handleSearchChange}
        />
        <SearchBarClearButton
          onClick={this.handleResetSearch}
          isVisible={searchValue !== ''}
        >
          {this.props.t('Searchbar.ClearTerm')}
        </SearchBarClearButton>
      </SearchBarWrapper>
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
