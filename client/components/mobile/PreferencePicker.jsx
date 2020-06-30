import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { prop } from '../../theme';


const PreferenceTitle = styled.h4.attrs(props => ({ ...props, className: 'preference__title' }))`
  color: ${prop('primaryTextColor')};
`;

const Preference = styled.div.attrs(props => ({ ...props, className: 'preference' }))`
  flex-wrap: nowrap !important;
  align-items: baseline !important;
  justify-items: space-between
`;


const Selector = ({
  title, value, onSelect, options,
}) => (
  <Preference>
    <PreferenceTitle>{title}</PreferenceTitle>
    <div className="preference__options">
      {options.map(option => (
        <React.Fragment><input
          type="radio"
          onChange={() => onSelect(option.value)}
          aria-label={option.ariaLabel}
          name={option.name}
          key={option.id}
          id={option.id}
          className="preference__radio-button"
          value={option.value}
          checked={value === option.value}
        /><label htmlFor={option.id} className="preference__option">{option.label}</label>
        </React.Fragment>))}
    </div>
  </Preference>
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
