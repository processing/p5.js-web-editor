import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Accepts all the props of an HTML <a> or <button> tag.
 */
export interface ButtonOrLinkProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Can be internal or external ('http'- or 'https'-).
   */
  href?: string;
  isDisabled?: boolean;
  /**
   * Content of the button/link.
   * Can be either a string or a complex element.
   */
  children: React.ReactNode;
  onClick?: (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) => void;
}

export type Ref = HTMLAnchorElement | HTMLButtonElement;

/**
 * Helper for switching between `<button>`, `<a>`, and `<Link>`
 * If providing an `href`, will render as a link instead of a button.
 *   - Internal links will use react-router.
 *   - External links should start with 'http' or 'https' and will open in a new window.
 */
export const ButtonOrLink = React.forwardRef(
  (
    {
      href,
      children,
      isDisabled = false,
      onClick,
      ...props
    }: ButtonOrLinkProps,
    ref: React.Ref<Ref>
  ) => {
    const handleClick = (
      e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
    ) => {
      if (isDisabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (onClick) {
        onClick(e);
      }
    };

    if (href) {
      if (href.startsWith('http')) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={isDisabled}
            {...props}
            onClick={handleClick}
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          to={href}
          aria-disabled={isDisabled}
          {...props}
          onClick={handleClick}
        >
          {children}
        </Link>
      );
    }
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        aria-disabled={isDisabled}
        {...props}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  }
);
