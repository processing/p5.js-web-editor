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
      <CloseIcon className="quick-add__remove-icon" role="img" aria-label="Descending" focusable="false" />
      <CheckIcon className="quick-add__in-icon" role="img" aria-label="Descending" focusable="false" />
      <CloseIcon className="quick-add__add-icon" role="img" aria-label="Descending" focusable="false" />
    </div>
  );
};

Icons.propTypes = {
  isAdded: PropTypes.bool.isRequired,
};

export default Icons;
