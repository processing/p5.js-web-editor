import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { prop, remSize } from '../../theme';

const PreferenceTitle = styled.h4.attrs((props) => ({
  ...props,
  className: 'preference__title'
}))`
  color: ${prop('primaryTextColor')};
`;

const Preference = styled.div.attrs((props) => ({
  ...props,
  className: 'preference'
}))`
  flex-wrap: nowrap !important;
  align-items: baseline !important;
  justify-items: space-between;
`;

const OptionLabel = styled.label.attrs({ className: 'preference__option' })`
  font-size: ${remSize(14)} !important;
`;

const PreferencePicker = ({ title, value, onSelect, options }) => (
  <Preference>
    <PreferenceTitle>{title}</PreferenceTitle>
    <div className="preference__options">
      {options.map((option) => (
        <React.Fragment key={`${option.name}-${option.id}`}>
          <input
            type="radio"
            onChange={() => onSelect(option.value)}
            aria-label={option.ariaLabel}
            name={option.name}
            key={`${option.name}-${option.id}-input`}
            id={option.id}
            className="preference__radio-button"
            value={option.value}
            checked={value === option.value}
          />
          <OptionLabel
            key={`${option.name}-${option.id}-label`}
            htmlFor={option.id}
          >
            {option.label}
          </OptionLabel>
        </React.Fragment>
      ))}
    </div>
  </Preference>
);

PreferencePicker.defaultProps = {
  options: []
};

PreferencePicker.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]).isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      label: PropTypes.string,
      ariaLabel: PropTypes.string
    })
  ),
  onSelect: PropTypes.func.isRequired
};

export default PreferencePicker;
