import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';

import { remSize, prop } from '../theme';

// The '&&&' will increase the specificity of the
// component's CSS so that it overrides the more
// general global styles
const StyledButton = styled.button`
  &&& {
    display: flex;
    justify-content: center;
    align-items: center;

    width: max-content;
    text-decoration: none;

    background-color: ${prop('buttonColorBackground')};
    color: ${prop('buttonColor')};
    cursor: pointer;
    border: 2px solid ${prop('buttonBorderColor')};
    border-radius: 2px;
    padding: ${remSize(8)} ${remSize(25)};
    line-height: 1;
    
    &:hover:not(:disabled) {
      color: ${prop('buttonHoverColor')};
      background-color: ${prop('buttonHoverColorBackground')};
    }

    &:disabled {
      color: ${prop('buttonDisabledColor')};
      background-color: ${prop('buttonDisabledColorBackground')};
      cursor: not-allowed;
    }

    > *:not(:last-child) {
      margin-right: ${remSize(8)};
    }
  }
`;

/**
 * A Button performs an primary action
 */
const Button = ({
  children, href, label, to, type, ...props
}) => {
  if (href) {
    return <StyledButton as="a" aria-label={label} href={href} {...props}>{children}</StyledButton>;
  }

  if (to) {
    return <StyledButton as={Link} aria-label={label} to={to} {...props}>{children}</StyledButton>;
  }

  return <StyledButton aria-label={label} type={type} {...props}>{children}</StyledButton>;
};

Button.defaultProps = {
  disabled: false,
  href: null,
  label: null,
  to: null,
  type: 'button',
};

Button.propTypes = {
  /**
   * The visible part of the button, telling the user what
   * the action is
   */
  children: PropTypes.element.isRequired,
  /**
    If the button can be activated or not
  */
  disabled: PropTypes.bool,
  /**
   * Specifying an href will use an <a> to link to the URL
   */
  href: PropTypes.string,
  /*
   * An ARIA Label used for accessibility
   */
  label: PropTypes.string,
  /**
   * Specifying a to URL will use a react-router Link
   */
  to: PropTypes.string,
  /**
   * If using a button, then type is defines the type of button
   */
  type: PropTypes.oneOf(['button', 'submit']),
};

export default Button;
