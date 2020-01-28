import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import Icons from './Icons';

const Item = ({
  isAdded, onSelect, name, url
}) => (
  <li className="quick-add__item">
    <button className="quick-add__item-toggle" onClick={onSelect}>
      <Icons isAdded={isAdded} />
      {name}
    </button>
    <Link className="quick-add__item-view" to={url}>View</Link>
  </li>
);

const ItemType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  isAdded: PropTypes.bool.isRequired,
});

Item.propTypes = {
  ...ItemType,
  onSelect: PropTypes.func.isRequired,
};

const QuickAddList = ({
  items, onAdd, onRemove
}) => {
  const handleAction = (item) => {
    if (item.isAdded) {
      onRemove(item);
    } else {
      onAdd(item);
    }
  };

  return (
    <ul className="quick-add">{items.map(item => (<Item
      key={item.id}
      {...item}
      onSelect={
        () => handleAction(item)
      }
    />))}
    </ul>
  );
};

QuickAddList.propTypes = {
  items: PropTypes.arrayOf(ItemType).isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default QuickAddList;
