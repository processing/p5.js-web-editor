import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import styled from 'styled-components';
import MenuItem from '../../../../components/Dropdown/MenuItem';
import TableDropdown from '../../../../components/Dropdown/TableDropdown';
import * as ProjectActions from '../../actions/project';
import * as CollectionsActions from '../../actions/collections';
import * as IdeActions from '../../actions/ide';
import * as ToastActions from '../../actions/toast';
import dates from '../../../../utils/formatDate';
import { remSize, prop } from '../../../../theme';

const SketchsTableRow = styled.tr`
  &&& {
    margin: ${remSize(10)};
    height: ${remSize(72)};
    font-size: ${remSize(16)};
  }
  &:nth-child(odd) {
    background: ${prop('tableRowStripeColor')};
  }

  > th:nth-child(1) {
    padding-left: ${remSize(12)};
  }

  > td {
    padding-left: ${remSize(8)};
  }

  a {
    color: ${prop('primaryTextColor')};
  }

  &.is-deleted > * {
    font-style: italic;
  }
  @media (max-width: 770px) {
    &&& {
      margin: 0;
      position: relative;
      display: flex;
      flex-wrap: wrap;
      padding: ${remSize(15)};
      height: fit-content;
      gap: ${remSize(8)};
      border: 1px solid ${prop('modalBorderColor')};
      background-color: ${prop('searchBackgroundColor')};
      > th {
        padding-left: 0;
        width: 100%;
        font-weight: bold;
        margin-bottom: ${remSize(6)};
      }
      > td {
        padding-left: 0;
        width: 30%;
        font-size: ${remSize(14)};
        color: ${prop('modalBorderColor')};
      }
    }
  }
`;
const SketchesTableName = styled.span`
  &&& {
    display: flex;
    align-items: center;
  }
`;
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
  };

  const handleRenameChange = (e) => {
    setRenameValue(e.target.value);
  };

  const handleRenameEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateName();
      closeAll();
    }
  };

  const handleRenameFocus = () => {
    if (renameInput.current) {
      renameInput.current.focus();
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
            onKeyDown={handleRenameEnter}
            onBlur={handleRenameBlur}
            onClick={(e) => e.stopPropagation()}
            ref={(node) => {
              renameInput.current = node;
              handleRenameFocus();
            }}
          />
        )}
      </>
    );
  };

  const { collection, mobile } = props;

  return (
    <SketchsTableRow key={collection.id}>
      <th scope="row">
        <SketchesTableName>{renderCollectionName()}</SketchesTableName>
      </th>
      <td>{formatDateCell(collection.createdAt, mobile)}</td>
      <td>{formatDateCell(collection.updatedAt, mobile)}</td>
      <td>
        {mobile && 'sketches: '}
        {(collection.items || []).length}
      </td>
      <SketchlistDropdownColumn>{renderActions()}</SketchlistDropdownColumn>
    </SketchsTableRow>
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
