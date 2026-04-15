import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { removeFromCollection } from '../../IDE/actions/collections';
import { formatDateToString } from '../../../utils/formatDate';
import { TableDropdown } from '../../../components/Dropdown/TableDropdown';
import { MenuItem } from '../../../components/Dropdown/MenuItem';
import { remSize } from '../../../theme';

const SketchlistDropdownColumn = styled.td`
  &&& {
    position: relative;
    width: ${remSize(60)};
  }
  @media (max-width: 770px) {
    &&& {
      position: absolute;
      top: 0;
      right: ${remSize(4)};
      width: auto !important;
      margin: ${remSize(8)};
    }
  }
`;

const WiderTableDropdown = styled(TableDropdown)`
  & ul {
    width: ${remSize(220)};
    top: 74%;
    right: calc(100% - 26px);
  }
`;

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
      <td>{formatDateToString(item.createdAt)}</td>
      <td>{sketchOwnerUsername}</td>
      <SketchlistDropdownColumn>
        {isOwner && (
          <WiderTableDropdown aria-label={t('SketchList.ToggleLabelARIA')}>
            <MenuItem onClick={handleSketchRemove}>
              {t('Collection.SketchRemoveARIA')}
            </MenuItem>
          </WiderTableDropdown>
        )}
      </SketchlistDropdownColumn>
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
