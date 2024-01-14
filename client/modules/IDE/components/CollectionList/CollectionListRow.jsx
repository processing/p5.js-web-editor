import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import MenuItem from '../../../../components/Dropdown/MenuItem';
import TableDropdown from '../../../../components/Dropdown/TableDropdown';
import * as ProjectActions from '../../actions/project';
import * as CollectionsActions from '../../actions/collections';
import * as IdeActions from '../../actions/ide';
import * as ToastActions from '../../actions/toast';
import dates from '../../../../utils/formatDate';

const formatDateCell = (date, mobile = false) =>
  dates.format(date, { showTime: !mobile });

const CollectionListRowBase = (props) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const renameInput = useRef(null);

  const closeAll = () => {
    setRenameOpen(false);
  };

  const updateName = () => {
    const isValid = renameValue.trim().length !== 0;
    if (isValid) {
      props.editCollection(props.collection.id, {
        name: renameValue.trim()
      });
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
        props.t('Common.DeleteConfirmation', {
          name: props.collection.name
        })
      )
    ) {
      props.deleteCollection(props.collection.id);
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
        aria-label={props.t('CollectionListRow.ToggleCollectionOptionsARIA')}
      >
        <MenuItem onClick={handleAddSketches}>
          {props.t('CollectionListRow.AddSketch')}
        </MenuItem>
        <MenuItem hideIf={!userIsOwner} onClick={handleCollectionDelete}>
          {props.t('CollectionListRow.Delete')}
        </MenuItem>
        <MenuItem hideIf={!userIsOwner} onClick={handleRenameOpen}>
          {props.t('CollectionListRow.Rename')}
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

CollectionListRowBase.propTypes = {
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
  deleteCollection: PropTypes.func.isRequired,
  editCollection: PropTypes.func.isRequired,
  onAddSketches: PropTypes.func.isRequired,
  mobile: PropTypes.bool,
  t: PropTypes.func.isRequired
};

CollectionListRowBase.defaultProps = {
  mobile: false
};

function mapDispatchToPropsSketchListRow(dispatch) {
  return bindActionCreators(
    Object.assign(
      {},
      CollectionsActions,
      ProjectActions,
      IdeActions,
      ToastActions
    ),
    dispatch
  );
}

export default withTranslation()(
  connect(null, mapDispatchToPropsSketchListRow)(CollectionListRowBase)
);
