import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { prop } from '../../theme';


const PreferenceTitle = styled.h4.attrs(props => ({ ...props, className: 'preference__title' }))`
  color: ${prop('primaryTextColor')} !important;
`;

const Selector = ({
  title, value, onSelect, options,
}) => (
  <div className="preference">
    {/* <h4 className="preference__title">{title}</h4> */}
    <PreferenceTitle>{title}</PreferenceTitle>
    {options.map(option => (
      <div className="preference__options" key={option.id}>
        <input
          type="radio"
          onChange={() => onSelect(option.value)}
          aria-label={option.ariaLabel}
          name={option.name}
          id={option.id}
          className="preference__radio-button"
          value={option.value}
          checked={value === option.value}
        />
        <label htmlFor={option.id} className="preference__option">{option.label}</label>
      </div>))}
  </div>
);

Selector.defaultProps = {
  options: []
};

Selector.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    ariaLabel: PropTypes.string,
  })),
  onSelect: PropTypes.func.isRequired,
};

export default Selector;
