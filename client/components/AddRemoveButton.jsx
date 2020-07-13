import React from 'react';
import PropTypes from 'prop-types';

import AddIcon from '../images/plus.svg';
import RemoveIcon from '../images/minus.svg';

const AddRemoveButton = ({ type, onClick }) => {
  const alt = type === 'add' ? 'Add to collection' : 'Remove from collection';
  const Icon = type === 'add' ? AddIcon : RemoveIcon;

  return (
    <button
      className="overlay__close-button"
      onClick={onClick}
      aria-label={alt}
    >
      <Icon focusable="false" aria-hidden="true" />
    </button>
  );
};

AddRemoveButton.propTypes = {
  type: PropTypes.oneOf(['add', 'remove']).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default AddRemoveButton;
