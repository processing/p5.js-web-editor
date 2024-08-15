import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Icons from './Icons';

const Item = ({ isAdded, onSelect, name, url }) => {
  const { t } = useTranslation();
  const buttonLabel = isAdded
    ? t('QuickAddList.ButtonRemoveARIA')
    : t('QuickAddList.ButtonAddToCollectionARIA');

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onSelect(event);
    }
  };

  return (
    <div
      role="button"
      className="quick-add__item"
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button
        className="quick-add__item-toggle"
        onClick={onSelect}
        aria-label={buttonLabel}
      >
        <Icons isAdded={isAdded} />
      </button>
      <span className="quick-add__item-name">{name}</span>
      <Link
        className="quick-add__item-view"
        to={url}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
      >
        {t('QuickAddList.View')}
      </Link>
    </div>
  );
};

const ItemType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  isAdded: PropTypes.bool.isRequired
});

Item.propTypes = {
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  isAdded: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired
};

const QuickAddList = ({ items, onAdd, onRemove }) => {
  const handleAction = (item) => {
    if (item.isAdded) {
      onRemove(item);
    } else {
      onAdd(item);
    }
  };

  return (
    <ul className="quick-add">
      {items.map((item) => (
        <Item
          key={item.id}
          {...item}
          onSelect={(event) => {
            event.stopPropagation();
            event.currentTarget.blur();
            handleAction(item);
          }}
        />
      ))}
    </ul>
  );
};

QuickAddList.propTypes = {
  items: PropTypes.arrayOf(ItemType).isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired
};

export default QuickAddList;
