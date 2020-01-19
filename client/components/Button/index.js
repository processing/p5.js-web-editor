import React from "react";
import PropTypes from "prop-types";
import styled from 'styled-components';
import { remSize, prop } from '../../theme';

const StyledButton = styled.button`
  background-color: ${prop('buttonColorBackground')};
  color: ${prop('buttonColor')};
  cursor: pointer;
  border: 2px solid ${prop('buttonBorderColor')};
  border-radius: 2px;
  padding: ${remSize(8)} ${remSize(25)};
  line-height: 1;
  margin: 0;

  &:hover:not(:disabled) {
    color: ${prop('buttonHoverColor')};
    background-color: ${prop('buttonHoverColorBackground')};
  }

  &:disabled {
    color: ${prop('buttonDisabledColor')};
    background-color: ${prop('buttonDisabledColorBackground')};
    cursor: not-allowed;
  }
`;

/**
 * This text will be used for the description in the story
 */
const Button = ({ children, label, ...props }) => {
  return <StyledButton aria-label={label} {...props}>{children}</StyledButton>;
}

Button.propTypes = {
  /**
   * The visible part of the button
   */
  children: PropTypes.element.isRequired,
  /**
    If the button can be clicked or not
  */
  disabled: PropTypes.bool,
  /*
   * An ARIA Label used for accessibility
   */
  label: PropTypes.string.isRequired,
};

export default Button;
