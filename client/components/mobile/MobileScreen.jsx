import React from 'react';
import PropTypes from 'prop-types';

const Screen = ({ children, fullscreen }) => (
  <div className={fullscreen && 'fullscreen-preview'}>
    {children}
  </div>
);

Screen.defaultProps = {
  fullscreen: false
};

Screen.propTypes = {
  children: PropTypes.node.isRequired,
  fullscreen: PropTypes.bool
};

export default Screen;
