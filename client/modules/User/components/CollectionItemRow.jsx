import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { removeFromCollection } from '../../IDE/actions/collections';
import dates from '../../../utils/formatDate';
import RemoveIcon from '../../../images/close.svg';

const CollectionItemRow = ({ collection, item, isOwner }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const projectIsDeleted = item.isDeleted;
  const projectIsPrivate =
    !item.isDeleted && !isOwner && item.project?.visibility === 'Private';
  const handleSketchRemove = () => {
    const name = projectIsDeleted ? 'deleted sketch' : item.project.name;

    if (
      window.confirm(
        t('Collection.DeleteFromCollection', { name_sketch: name })
      )
    ) {
      dispatch(removeFromCollection(collection.id, item.project.id));
    }
  };

  const name = projectIsDeleted ? (
    <span>{t('Collection.SketchDeleted')}</span>
  ) : (
    <Link to={`/${item.project.user.username}/sketches/${item.project.id}`}>
      {item.project.name}
    </Link>
  );

  const sketchOwnerUsername = projectIsDeleted
    ? null
    : item.project.user.username;

  return (
    <tr
      className={`sketches-table__row ${
        projectIsDeleted || projectIsPrivate ? 'is-deleted-or-private' : ''
      }`}
    >
      <th scope="row">{name}</th>
      <td>{dates.format(item.createdAt)}</td>
      <td>{sketchOwnerUsername}</td>
      <td className="collection-row__action-column">
        {isOwner && (
          <button
            className="collection-row__remove-button"
            onClick={handleSketchRemove}
            aria-label={t('Collection.SketchRemoveARIA')}
          >
            <RemoveIcon focusable="false" aria-hidden="true" />
          </button>
        )}
      </td>
    </tr>
  );
};

CollectionItemRow.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  item: PropTypes.shape({
    createdAt: PropTypes.string.isRequired,
    isDeleted: PropTypes.bool.isRequired,
    project: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      user: PropTypes.shape({
        username: PropTypes.string.isRequired
      }),
      visibility: PropTypes.string
    })
  }).isRequired,
  isOwner: PropTypes.bool.isRequired
};

export default CollectionItemRow;
