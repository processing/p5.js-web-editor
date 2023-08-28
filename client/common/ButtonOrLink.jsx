import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Helper for switching between <button>, <a>, and <Link>
 */
const ButtonOrLink = ({ href, children, ...props }) => {
  if (href) {
    if (href.startsWith('http')) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link to={href} {...props}>
        {children}
      </Link>
    );
  }
  return <button {...props}>{children}</button>;
};

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
  /**
   * Content of the button/link.
   * Can be either a string or a complex element.
   */
  children: PropTypes.node.isRequired
};

ButtonOrLink.defaultProps = {
  href: null
};

export default ButtonOrLink;
