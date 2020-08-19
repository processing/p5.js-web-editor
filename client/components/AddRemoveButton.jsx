import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


import AddIcon from '../images/plus.svg';
import RemoveIcon from '../images/minus.svg';

const AddRemoveButton = ({ type, onClick, t }) => {
  const alt = type === 'add' ? t('AddRemoveButton.altAdd') : t('AddRemoveButton.altRemove');
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
  t: PropTypes.func.isRequired
};

export default withTranslation()(AddRemoveButton);
