import React, { PropTypes } from 'react';

function Overlay(props) {
  return (
    <div className="overlay">
      <div className="overlay-content">
        {props.children}
      </div>
    </div>
  );
}

Overlay.propTypes = {
  children: PropTypes.element
};

Overlay.defaultProps = {
  children: null
};

export default Overlay;
