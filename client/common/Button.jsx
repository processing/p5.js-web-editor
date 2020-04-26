import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';

import { remSize, prop } from '../theme';
import Icon, { ValidIconNameType } from './Icon';

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

      svg * {
        fill: ${prop('buttonHoverColor')};
      }
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
  children, href, iconAfterName, iconBeforeName, label, to, type, ...props
}) => {
  const iconAfter = iconAfterName && <Icon name={iconAfterName} />;
  const iconBefore = iconBeforeName && <Icon name={iconBeforeName} />;

  const content = <>{iconBefore}<span>{children}</span>{iconAfter}</>;

  if (href) {
    return <StyledButton as="a" aria-label={label} href={href} {...props}>{content}</StyledButton>;
  }

  if (to) {
    return <StyledButton as={Link} aria-label={label} to={to} {...props}>{content}</StyledButton>;
  }

  return <StyledButton aria-label={label} type={type} {...props}>{content}</StyledButton>;
};

Button.defaultProps = {
  disabled: false,
  iconAfterName: null,
  iconBeforeName: null,
  href: null,
  label: null,
  to: null,
  type: 'button',
};

Button.iconNames = Icon.names;

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
   * Name of icon to place before child content
   */
  iconAfterName: ValidIconNameType,

  /**
   * Name of icon to place after child content
   */
  iconBeforeName: ValidIconNameType,
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
