import React from "react";
import PropTypes from "prop-types";
import styled from 'styled-components';

const StyledButton = styled.button`
  margin: 0;
  padding: 0;
  border: none;
  background: none;
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
  disabled: PropTypes.boolean,
  /*
   * An ARIA Label used for accessibility
   */
  label: PropTypes.string.isRequired,
};

export default Button;
