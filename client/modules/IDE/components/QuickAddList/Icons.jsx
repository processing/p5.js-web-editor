import React from 'react';
import PropTypes from 'prop-types';

import CheckIcon from '../../../../images/check_encircled.svg';
import CloseIcon from '../../../../images/close.svg';

const Icons = ({ isAdded }) => {
  const classes = [
    'quick-add__icon',
    isAdded ? 'quick-add__icon--in-collection' : 'quick-add__icon--not-in-collection'
  ].join(' ');

  return (
    <div className={classes}>
      <CloseIcon className="quick-add__remove-icon" title="Remove from collection" />
      <CheckIcon className="quick-add__in-icon" title="In collection" />
      <CloseIcon className="quick-add__add-icon" title="Add to collection" />
    </div>
  );
};

Icons.propTypes = {
  isAdded: PropTypes.bool.isRequired,
};

export default Icons;
