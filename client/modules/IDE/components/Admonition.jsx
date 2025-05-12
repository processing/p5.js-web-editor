import React from 'react';
import PropTypes from 'prop-types';

export default function Admonition({ children, title }) {
  return (
    <div className="admonition">
      <p className="admonition__title">
        <strong>{title}</strong>
      </p>
      {children}
    </div>
  );
}

Admonition.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node
};

Admonition.defaultProps = {
  children: undefined
};
