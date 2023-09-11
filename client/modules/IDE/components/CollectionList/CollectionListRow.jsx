import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import * as ProjectActions from '../../actions/project';
import * as CollectionsActions from '../../actions/collections';
import * as IdeActions from '../../actions/ide';
import * as ToastActions from '../../actions/toast';
import formatDate from '../../../../utils/formatDate';

import DownFilledTriangleIcon from '../../../../images/down-filled-triangle.svg';
import MoreIconSvg from '../../../../images/more.svg';

const CollectionListRowBase = (props) => {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(props.collection.name);
  const renameInputRef = useRef(null);

  const projectInCollection = (project, collection) =>
    collection.items.find((item) => item.project.id === project.id) != null;

  const onFocusComponent = () => {
    setIsFocused(true);
  };

  const onBlurComponent = () => {
    setIsFocused(false);
    setTimeout(() => {
      if (!isFocused) {
        // eslint-disable-next-line no-use-before-define
        closeAll();
      }
    }, 200);
  };

  const openOptions = () => {
    setOptionsOpen(true);
  };

  const closeOptions = () => {
    setOptionsOpen(false);
  };

  const toggleOptions = () => {
    if (optionsOpen) {
      closeOptions();
    } else {
      openOptions();
    }
  };

  const closeAll = () => {
    setOptionsOpen(false);
    setRenameOpen(false);
  };

  const handleAddSketches = () => {
    closeAll();
    props.onAddSketches();
  };

  const handleDropdownOpen = () => {
    closeAll();
    openOptions();
  };

  const handleCollectionDelete = () => {
    closeAll();
    if (
      window.confirm(
        props.t('Common.DeleteConfirmation', { name: props.collection.name })
      )
    ) {
      props.deleteCollection(props.collection.id);
    }
  };

  const handleRenameOpen = () => {
    closeAll();
    setRenameOpen(true);
    renameInputRef.current.focus();
  };

  const handleRenameChange = (e) => {
    setRenameValue(e.target.value);
  };

  const handleRenameEnter = (e) => {
    if (e.key === 'Enter') {
      // eslint-disable-next-line no-use-before-define
      updateName();
      closeAll();
    }
  };

  const handleRenameBlur = () => {
    // eslint-disable-next-line no-use-before-define
    updateName();
    closeAll();
  };

  const updateName = () => {
    const isValid = renameValue.trim().length !== 0;
    if (isValid) {
      props.editCollection(props.collection.id, {
        name: renameValue.trim()
      });
    }
  };

  const renderActions = () => {
    const { mobile, user, username } = props;
    // eslint-disable-next-line no-shadow, no-use-before-define
    const { optionsOpen } = optionsOpen;
    const userIsOwner = user.username === username;

    return (
      <React.Fragment>
        <button
          className="sketch-list__dropdown-button"
          onClick={toggleOptions}
          onBlur={onBlurComponent}
          onFocus={onFocusComponent}
          aria-label={props.t('CollectionListRow.ToggleCollectionOptionsARIA')}
        >
          {mobile ? (
            <MoreIconSvg focusable="false" aria-hidden="true" />
          ) : (
            <DownFilledTriangleIcon focusable="false" aria-hidden="true" />
          )}
        </button>
        {optionsOpen && (
          <ul className="sketch-list__action-dialogue">
            <li>
              <button
                className="sketch-list__action-option"
                onClick={handleAddSketches}
                onBlur={onBlurComponent}
                onFocus={onFocusComponent}
              >
                {props.t('CollectionListRow.AddSketch')}
              </button>
            </li>
            {userIsOwner && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={handleCollectionDelete}
                  onBlur={onBlurComponent}
                  onFocus={onFocusComponent}
                >
                  {props.t('CollectionListRow.Delete')}
                </button>
              </li>
            )}
            {userIsOwner && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={handleRenameOpen}
                  onBlur={onBlurComponent}
                  onFocus={onFocusComponent}
                >
                  {props.t('CollectionListRow.Rename')}
                </button>
              </li>
            )}
          </ul>
        )}
      </React.Fragment>
    );
  };

  const renderCollectionName = () => {
    const { collection, username } = props;
    // eslint-disable-next-line no-shadow, no-use-before-define
    const { renameOpen } = renameOpen;

    return (
      <React.Fragment>
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
            ref={renameInputRef}
          />
        )}
      </React.Fragment>
    );
  };

  const { collection, mobile } = props;

  return (
    <tr className="sketches-table__row" key={collection.id}>
      <th scope="row">
        <span className="sketches-table__name">{renderCollectionName()}</span>
      </th>
      <td>{formatDate(collection.createdAt, mobile)}</td>
      <td>{formatDate(collection.updatedAt, mobile)}</td>
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
  // eslint-disable-next-line react/require-default-props
  mobile: PropTypes.bool,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  deleteCollection: PropTypes.func.isRequired,
  editCollection: PropTypes.func.isRequired,
  onAddSketches: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired
};

const mapDispatchToPropsSketchListRow = (dispatch) =>
  bindActionCreators(
    Object.assign(
      {},
      CollectionsActions,
      ProjectActions,
      IdeActions,
      ToastActions
    ),
    dispatch
  );

export default withTranslation()(
  connect(null, mapDispatchToPropsSketchListRow)(CollectionListRowBase)
);
