import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { remSize, prop } from '../theme';

const kinds = {
  primary: 'primary',
  secondary: 'secondary'
};

const displays = {
  block: 'block',
  inline: 'inline'
};

// The '&&&' will increase the specificity of the
// component's CSS so that it overrides the more
// general global styles
const StyledButton = styled.button`
  &&& {
    font-weight: bold;
    display: ${({ display }) =>
      display === displays.inline ? 'inline-flex' : 'flex'};
    justify-content: center;
    align-items: center;

    width: max-content;
    text-decoration: none;

    color: ${({ kind }) => prop(`Button.${kind}.default.foreground`)};
    background-color: ${({ kind }) =>
      prop(`Button.${kind}.default.background`)};
    cursor: pointer;
    border: 2px solid ${({ kind }) => prop(`Button.${kind}.default.border`)};
    border-radius: 2px;
    padding: ${remSize(8)} ${remSize(25)};
    line-height: 1;

    svg * {
      fill: ${({ kind }) => prop(`Button.${kind}.default.foreground`)};
    }

    &:hover:not(:disabled) {
      color: ${({ kind }) => prop(`Button.${kind}.hover.foreground`)};
      background-color: ${({ kind }) =>
        prop(`Button.${kind}.hover.background`)};
      border-color: ${({ kind }) => prop(`Button.${kind}.hover.border`)};

      svg * {
        fill: ${({ kind }) => prop(`Button.${kind}.hover.foreground`)};
      }
    }

    &:active:not(:disabled) {
      color: ${({ kind }) => prop(`Button.${kind}.active.foreground`)};
      background-color: ${({ kind }) =>
        prop(`Button.${kind}.active.background`)};

      svg * {
        fill: ${({ kind }) => prop(`Button.${kind}.active.foreground`)};
      }
    }

    &:disabled {
      color: ${({ kind }) => prop(`Button.${kind}.disabled.foreground`)};
      background-color: ${({ kind }) =>
        prop(`Button.${kind}.disabled.background`)};
      border-color: ${({ kind }) => prop(`Button.${kind}.disabled.border`)};
      cursor: not-allowed;

      svg * {
        fill: ${({ kind }) => prop(`Button.${kind}.disabled.foreground`)};
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

/**
 * A Button performs an primary action
 */
const Button = ({
  children,
  display,
  href,
  kind,
  iconBefore,
  iconAfter,
  iconOnly,
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

  if (iconOnly) {
    StyledComponent = StyledInlineButton;
  }

  if (href) {
    return (
      <StyledComponent
        kind={kind}
        display={display}
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
        display={display}
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
    <StyledComponent
      kind={kind}
      display={display}
      aria-label={ariaLabel}
      type={type}
      {...props}
    >
      {content}
    </StyledComponent>
  );
};

Button.defaultProps = {
  children: null,
  disabled: false,
  display: displays.block,
  iconAfter: null,
  iconBefore: null,
  iconOnly: false,
  kind: kinds.primary,
  href: null,
  'aria-label': null,
  to: null,
  type: 'button'
};

Button.kinds = kinds;
Button.displays = displays;

Button.propTypes = {
  /**
   * The visible part of the button, telling the user what
   * the action is
   */
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  /**
    If the button can be activated or not
  */
  disabled: PropTypes.bool,
  /**
   * The display type of the button—inline or block
   */
  display: PropTypes.oneOf(Object.values(displays)),
  /**
   * SVG icon to place after child content
   */
  iconAfter: PropTypes.element,
  /**
   * SVG icon to place before child content
   */
  iconBefore: PropTypes.element,
  /**
   * If the button content is only an SVG icon
   */
  iconOnly: PropTypes.bool,
  /**
   * The kind of button - determines how it appears visually
   */
  kind: PropTypes.oneOf(Object.values(kinds)),
  /**
   * Specifying an href will use an <a> to link to the URL
   */
  href: PropTypes.string,
  /**
   * An ARIA Label used for accessibility
   */
  'aria-label': PropTypes.string,
  /**
   * Specifying a to URL will use a react-router Link
   */
  to: PropTypes.string,
  /**
   * If using a button, then type is defines the type of button
   */
  type: PropTypes.oneOf(['button', 'submit'])
};

export default Button;
