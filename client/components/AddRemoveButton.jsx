import React from 'react';
import PropTypes from 'prop-types';
import InlineSVG from 'react-inlinesvg';

const addIcon = require('../images/plus.svg');
const removeIcon = require('../images/minus.svg');

const AddRemoveButton = ({ type, onClick }) => {
  const alt = type === 'add' ? 'add to collection' : 'remove from collection';
  const icon = type === 'add' ? addIcon : removeIcon;

  return (
    <button className="overlay__close-button" onClick={onClick}>
      <InlineSVG src={icon} alt={alt} />
    </button>
  );
};

AddRemoveButton.propTypes = {
  type: PropTypes.oneOf(['add', 'remove']).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default AddRemoveButton;
