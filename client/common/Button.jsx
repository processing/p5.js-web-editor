import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';

import { remSize, prop } from '../theme';

const kinds = {
  block: 'block',
  icon: 'icon',
  inline: 'inline'
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

    color: ${prop('Button.default.foreground')};
    background-color: ${prop('Button.default.background')};
    cursor: pointer;
    border: 2px solid ${prop('Button.default.border')};
    border-radius: 2px;
    padding: ${remSize(8)} ${remSize(25)};
    line-height: 1;

    svg * {
      fill: ${prop('Button.default.foreground')};
    }

    &:hover:not(:disabled) {
      color: ${prop('Button.hover.foreground')};
      background-color: ${prop('Button.hover.background')};
      border-color: ${prop('Button.hover.border')};

      svg * {
        fill: ${prop('Button.hover.foreground')};
      }
    }

    &:active:not(:disabled) {
      color: ${prop('Button.active.foreground')};
      background-color: ${prop('Button.active.background')};

      svg * {
        fill: ${prop('Button.active.foreground')};
      }
    }

    &:disabled {
      color: ${prop('Button.disabled.foreground')};
      background-color: ${prop('Button.disabled.background')};
      border-color: ${prop('Button.disabled.border')};
      cursor: not-allowed;

      svg * {
        fill: ${prop('Button.disabled.foreground')};
      }
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

    color: ${prop('Button.default.foreground')};
    background-color: ${prop('Button.hover.background')};
    cursor: pointer;
    border: 1px solid transparent;
    border-radius: 50%;
    padding: ${remSize(8)} ${remSize(25)};
    line-height: 1;

    &:hover:not(:disabled) {
      color: ${prop('Button.hover.foreground')};
      background-color: ${prop('Button.hover.background')};

      svg * {
        fill: ${prop('Button.hover.foreground')};
      }
    }

    &:active:not(:disabled) {
      color: ${prop('Button.active.foreground')};
      background-color: ${prop('Button.active.background')};

      svg * {
        fill: ${prop('Button.active.foreground')};
      }
    }

    &:disabled {
      color: ${prop('Button.disabled.foreground')};
      background-color: ${prop('Button.disabled.background')};
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
  children,
  href,
  kind,
  iconBefore,
  iconAfter,
  'aria-label': ariaLabel,
  to,
  type,
  ...props
}) => {
  const hasChildren = React.Children.count(children) > 0;
  const content = (
    <>
      {iconBefore}
      {hasChildren && <span>{children}</span>}
      {iconAfter}
    </>
  );
  let StyledComponent = StyledButton;

  if (kind === kinds.inline) {
    StyledComponent = StyledInlineButton;
  } else if (kind === kinds.icon) {
    StyledComponent = StyledIconButton;
  }

  if (href) {
    return (
      <StyledComponent
        kind={kind}
        as="a"
        aria-label={ariaLabel}
        href={href}
        {...props}
      >
        {content}
      </StyledComponent>
    );
  }

  if (to) {
    return (
      <StyledComponent
        kind={kind}
        as={Link}
        aria-label={ariaLabel}
        to={to}
        {...props}
      >
        {content}
      </StyledComponent>
    );
  }

  return (
    <StyledComponent kind={kind} aria-label={ariaLabel} type={type} {...props}>
      {content}
    </StyledComponent>
  );
};

Button.defaultProps = {
  "children": null,
  "disabled": false,
  "iconAfter": null,
  "iconBefore": null,
  "kind": kinds.block,
  "href": null,
  'aria-label': null,
  "to": null,
  "type": 'button'
};

Button.kinds = kinds;

Button.propTypes = {
  /**
   * The visible part of the button, telling the user what
   * the action is
   */
  "children": PropTypes.element,
  /**
    If the button can be activated or not
  */
  "disabled": PropTypes.bool,
  /**
   * SVG icon to place after child content
   */
  "iconAfter": PropTypes.element,
  /**
   * SVG icon to place before child content
   */
  "iconBefore": PropTypes.element,
  /**
   * The kind of button - determines how it appears visually
   */
  "kind": PropTypes.oneOf(Object.values(kinds)),
  /**
   * Specifying an href will use an <a> to link to the URL
   */
  "href": PropTypes.string,
  /*
   * An ARIA Label used for accessibility
   */
  'aria-label': PropTypes.string,
  /**
   * Specifying a to URL will use a react-router Link
   */
  "to": PropTypes.string,
  /**
   * If using a button, then type is defines the type of button
   */
  "type": PropTypes.oneOf(['button', 'submit'])
};

export default Button;
