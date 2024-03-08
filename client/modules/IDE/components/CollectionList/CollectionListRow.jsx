import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import MenuItem from '../../../../components/Dropdown/MenuItem';
import TableDropdown from '../../../../components/Dropdown/TableDropdown';
import dates from '../../../../utils/formatDate';
import { deleteCollection, editCollection } from '../../actions/collections';

const formatDateCell = (date, mobile = false) =>
  dates.format(date, { showTime: !mobile });

const CollectionListRow = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const renameInput = useRef(null);

  const closeAll = () => {
    setRenameOpen(false);
  };

  const updateName = () => {
    const isValid = renameValue.trim().length !== 0;
    if (isValid) {
      dispatch(
        editCollection(props.collection.id, {
          name: renameValue.trim()
        })
      );
    }
  };

  const handleAddSketches = () => {
    closeAll();
    props.onAddSketches();
  };

  const handleCollectionDelete = () => {
    closeAll();
    if (
      window.confirm(
        t('Common.DeleteConfirmation', {
          name: props.collection.name
        })
      )
    ) {
      dispatch(deleteCollection(props.collection.id));
    }
  };

  const handleRenameOpen = () => {
    closeAll();
    setRenameOpen(true);
    setRenameValue(props.collection.name);
    if (renameInput.current) {
      renameInput.current.focus();
    }
  };

  const handleRenameChange = (e) => {
    setRenameValue(e.target.value);
  };

  const handleRenameEnter = (e) => {
    if (e.key === 'Enter') {
      updateName();
      closeAll();
    }
  };

  const handleRenameBlur = () => {
    updateName();
    closeAll();
  };

  const renderActions = () => {
    const userIsOwner = props.user.username === props.username;

    return (
      <TableDropdown
        aria-label={t('CollectionListRow.ToggleCollectionOptionsARIA')}
      >
        <MenuItem onClick={handleAddSketches}>
          {t('CollectionListRow.AddSketch')}
        </MenuItem>
        <MenuItem hideIf={!userIsOwner} onClick={handleCollectionDelete}>
          {t('CollectionListRow.Delete')}
        </MenuItem>
        <MenuItem hideIf={!userIsOwner} onClick={handleRenameOpen}>
          {t('CollectionListRow.Rename')}
        </MenuItem>
      </TableDropdown>
    );
  };

  const renderCollectionName = () => {
    const { collection, username } = props;

    return (
      <>
        <Link
          to={{
            pathname: `/${username}/collections/${collection.id}`,
            state: { skipSavingPath: true }
          }}
        >
          {renameOpen ? '' : collection.name}
        </Link>
        {renameOpen && (
          <input
            value={renameValue}
            onChange={handleRenameChange}
            onKeyUp={handleRenameEnter}
            onBlur={handleRenameBlur}
            onClick={(e) => e.stopPropagation()}
            ref={renameInput}
          />
        )}
      </>
    );
  };

  const { collection, mobile } = props;

  return (
    <tr className="sketches-table__row" key={collection.id}>
      <th scope="row">
        <span className="sketches-table__name">{renderCollectionName()}</span>
      </th>
      <td>{formatDateCell(collection.createdAt, mobile)}</td>
      <td>{formatDateCell(collection.updatedAt, mobile)}</td>
      <td>
        {mobile && 'sketches: '}
        {(collection.items || []).length}
      </td>
      <td className="sketch-list__dropdown-column">{renderActions()}</td>
    </tr>
  );
};

CollectionListRow.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      username: PropTypes.string.isRequired
    }).isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        project: PropTypes.shape({
          id: PropTypes.string.isRequired
        })
      })
    )
  }).isRequired,
  username: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  onAddSketches: PropTypes.func.isRequired,
  mobile: PropTypes.bool
};

CollectionListRow.defaultProps = {
  mobile: false
};

export default CollectionListRow;
