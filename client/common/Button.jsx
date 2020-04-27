import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';

import { remSize, prop } from '../theme';
import Icon, { ValidIconNameType } from './Icon';

const kinds = {
  block: 'block',
  icon: 'icon',
  inline: 'inline',
};

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

    > * + * {
      margin-left: ${remSize(8)};
    }
  }
`;

const StyledInlineButton = styled.button`
  &&& {
    display: flex;
    justify-content: center;
    align-items: center;

    text-decoration: none;

    color: ${prop('primaryTextColor')};
    cursor: pointer;
    border: none;
    line-height: 1;

    svg * {
      fill: ${prop('primaryTextColor')};
    }

    &:disabled {
      cursor: not-allowed;
    }

    > * + * {
      margin-left: ${remSize(8)};
    }
  }
`;

const StyledIconButton = styled.button`
  &&& {
    display: flex;
    justify-content: center;
    align-items: center;

    width: ${remSize(32)}px;
    height: ${remSize(32)}px;
    text-decoration: none;

    background-color: ${prop('buttonColorBackground')};
    color: ${prop('buttonColor')};
    cursor: pointer;
    border: 1px solid transparen;
    border-radius: 50%;
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

    > * + * {
      margin-left: ${remSize(8)};
    }
  }
`;

/**
 * A Button performs an primary action
 */
const Button = ({
  children, href, iconAfterName, iconBeforeName, kind, label, to, type, ...props
}) => {
  const iconAfter = iconAfterName && <Icon name={iconAfterName} />;
  const iconBefore = iconBeforeName && <Icon name={iconBeforeName} />;
  const hasChildren = React.Children.count(children) > 0;

  const content = <>{iconBefore}{hasChildren && <span>{children}</span>}{iconAfter}</>;

  let StyledComponent = StyledButton;

  if (kind === kinds.inline) {
    StyledComponent = StyledInlineButton;
  } else if (kind === kinds.icon) {
    StyledComponent = StyledIconButton;
  }

  if (href) {
    return <StyledComponent kind={kind} as="a" aria-label={label} href={href} {...props}>{content}</StyledComponent>;
  }

  if (to) {
    return <StyledComponent kind={kind} as={Link} aria-label={label} to={to} {...props}>{content}</StyledComponent>;
  }

  return <StyledComponent kind={kind} aria-label={label} type={type} {...props}>{content}</StyledComponent>;
};

Button.defaultProps = {
  children: null,
  disabled: false,
  iconAfterName: null,
  iconBeforeName: null,
  kind: kinds.block,
  href: null,
  label: null,
  to: null,
  type: 'button',
};

Button.iconNames = Icon.names;
Button.kinds = kinds;

Button.propTypes = {
  /**
   * The visible part of the button, telling the user what
   * the action is
   */
  children: PropTypes.element,
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
   * The kind of button - determines how it appears visually
   */
  kind: PropTypes.oneOf(Object.values(kinds)),
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
