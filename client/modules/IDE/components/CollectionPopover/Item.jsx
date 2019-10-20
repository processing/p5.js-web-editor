import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import InlineSVG from 'react-inlinesvg';

import check from '../../../../images/check.svg';

const checkIcon = (
  <InlineSVG className="sketch-list__check-icon" src={check} alt="In collection" />
);


const CollectionItem = ({ inCollection, collection, onSelect }) => (
  <li className="collection-popover__item">
    <div className="collection-popover__item__info">
      {inCollection && checkIcon}

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
  inCollection: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  collection: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
};

export default CollectionItem;
