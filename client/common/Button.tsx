import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { remSize, prop } from '../theme';

/**
 * Enum for the visual style of a Button.
 *
 * These values transpile to lowercase strings (`'primary' | 'secondary'`)
 * that map directly to keys in the `Button` object in `theme.js` for styling.
 */
export enum ButtonKinds {
  PRIMARY = 'primary',
  SECONDARY = 'secondary'
}
/**
 * Enum for the display type of a Button.
 *
 * These values transpile to lowercase strings (`'block' | 'inline'`)
 * and map to display styles in the `Button` object in `theme.js`.
 */
export enum ButtonDisplays {
  BLOCK = 'block',
  INLINE = 'inline'
}
/**
 * Enum for the native HTML button type.
 *
 * These values transpile to lowercase strings (`'button' | 'submit'`)
 * and correspond to the `type` attribute on a native <button>.
 * They can also be used in `theme.js` if needed for button-specific styles.
 */
export enum ButtonTypes {
  BUTTON = 'button',
  SUBMIT = 'submit'
}

export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The visible part of the button, telling the user what
   * the action is
   */
  children?: React.ReactNode;
  /**
      If the button can be activated or not
    */
  disabled?: boolean;
  /**
   * The display type of the button—inline or block
   */
  display?: ButtonDisplays;
  /**
   * SVG icon to place after child content
   */
  iconAfter?: React.ReactNode;
  /**
   * SVG icon to place before child content
   */
  iconBefore?: React.ReactNode;
  /**
   * If the button content is only an SVG icon
   */
  iconOnly?: boolean;
  /**
   * The kind of button - determines how it appears visually
   */
  kind?: ButtonKinds;
  /**
   * Specifying an href will use an <a> to link to the URL
   */
  href?: string;
  /**
   * An ARIA Label used for accessibility
   */
  'aria-label'?: string;
  /**
   * Specifying a to URL will use a react-router Link
   */
  to?: string;
  /**
   * If using a native button, specifies on an onClick action
   */
  onClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * If using a button, then type is defines the type of button
   */
  type?: ButtonTypes;
  /**
   * Controls whether the underlying SVG is focusable.
   * Only relevant for IconButton (or buttons that render an SVG as content).
   * In SVGs, the `focusable` attribute must be a string (`"true"` or `"false"`),
   * but React will automatically convert a boolean prop to the correct string value.
   */
  focusable?: boolean;
}

interface StyledButtonProps extends ButtonProps {
  kind: ButtonKinds;
  display: ButtonDisplays;
}

// The '&&&' will increase the specificity of the
// component's CSS so that it overrides the more
// general global styles
const StyledButton = styled.button<StyledButtonProps>`
  &&& {
    font-weight: bold;
    display: ${({ display }) =>
      display === ButtonDisplays.INLINE ? 'inline-flex' : 'flex'};
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
 * Renders a component with a button appearance, but which is:
 *  - External anchor link if passed a `href`
 *  - Internal React Router link if passed a `to`
 *  - Default: Native Button
 */
export const Button = ({
  children = null,
  display = ButtonDisplays.BLOCK,
  href,
  kind = ButtonKinds.PRIMARY,
  iconBefore = null,
  iconAfter = null,
  iconOnly = false,
  'aria-label': ariaLabel,
  to,
  type = ButtonTypes.BUTTON,
  ...props
}: ButtonProps) => {
  const hasChildren = React.Children.count(children) > 0;
  const content = (
    <>
      {iconBefore}
      {hasChildren && !iconOnly && <span>{children}</span>}
      {iconAfter}
    </>
  );
  const StyledComponent: React.ElementType = iconOnly
    ? StyledInlineButton
    : StyledButton;

  // Anchor Link
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

  // Internal React Router Link
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

  // Native Button
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
