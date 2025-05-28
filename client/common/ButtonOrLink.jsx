import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Helper for switching between <button>, <a>, and <Link>
 */

const ButtonOrLink = React.forwardRef(
  ({ href, children, isDisabled, onClick, ...props }, ref) => {
    const handleClick = (e) => {
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
            ref={ref}
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
          ref={ref}
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
        ref={ref}
        aria-disabled={isDisabled}
        {...props}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  }
);

/**
 * Accepts all the props of an HTML <a> or <button> tag.
 */
ButtonOrLink.propTypes = {
  /**
   * If providing an href, will render as a link instead of a button.
   * Can be internal or external.
   * Internal links will use react-router.
   * External links should start with 'http' or 'https' and will open in a new window.
   */
  href: PropTypes.string,
  isDisabled: PropTypes.bool,
  /**
   * Content of the button/link.
   * Can be either a string or a complex element.
   */
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func
};

ButtonOrLink.defaultProps = {
  href: null,
  isDisabled: false,
  onClick: null
};

export default ButtonOrLink;
