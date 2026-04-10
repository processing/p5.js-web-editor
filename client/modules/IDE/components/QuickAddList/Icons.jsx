import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import CloseIcon from '../../../../images/close.svg';
import CheckIcon from '../../../../images/check_encircled.svg';

const Icons = ({ isAdded }) => {
  const { t } = useTranslation();
  const classes = [
    'quick-add__icon',
    isAdded
      ? 'quick-add__icon--in-collection'
      : 'quick-add__icon--not-in-collection'
  ].join(' ');

  return (
    <div className={classes}>
      <CloseIcon
        className="quick-add__remove-icon"
        role="img"
        aria-label={t('QuickAddList.ButtonRemoveARIA')}
        focusable="false"
      />
      <CheckIcon
        className="quick-add__add-icon"
        role="img"
        aria-label={t('QuickAddList.ButtonAddToCollectionARIA')}
        focusable="false"
      />
    </div>
  );
};

Icons.propTypes = {
  isAdded: PropTypes.bool.isRequired
};

export default Icons;
