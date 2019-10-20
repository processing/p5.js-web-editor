import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';

const CollectionItem = ({ collection, onSelect }) => (
  <li className="collection-popover__item">
    <div className="collection-popover__item__info">
      <button onClick={onSelect}>
        {collection.name}
      </button>
    </div>

    <div className="collection-popover__item__view">
      <Link className="collection-popover__item__view-button" to={`/${collection.owner.username}/collections/${collection.id}`}>View</Link>
    </div>
  </li>
);

CollectionItem.propTypes = {
  onSelect: PropTypes.func.isRequired,
  collection: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
};

export default CollectionItem;
