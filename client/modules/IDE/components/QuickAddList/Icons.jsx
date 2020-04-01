import React from 'react';
import PropTypes from 'prop-types';
import InlineSVG from 'react-inlinesvg';

const check = require('../../../../images/check_encircled.svg');
const close = require('../../../../images/close.svg');

const Icons = ({ isAdded }) => {
  const classes = [
    'quick-add__icon',
    isAdded ? 'quick-add__icon--in-collection' : 'quick-add__icon--not-in-collection'
  ].join(' ');

  return (
    <div className={classes}>
      <InlineSVG className="quick-add__remove-icon" src={close} alt="Remove from collection" />
      <InlineSVG className="quick-add__in-icon" src={check} alt="In collection" />
      <InlineSVG className="quick-add__add-icon" src={close} alt="Add to collection" />
    </div>
  );
};

Icons.propTypes = {
  isAdded: PropTypes.bool.isRequired,
};

export default Icons;
