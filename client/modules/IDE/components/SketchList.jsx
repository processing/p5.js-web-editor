import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import slugify from 'slugify';
import dates from '../../../utils/formatDate';
import * as ProjectActions from '../actions/project';
import * as ProjectsActions from '../actions/projects';
import * as CollectionsActions from '../actions/collections';
import * as ToastActions from '../actions/toast';
import * as SortingActions from '../actions/sorting';
import * as IdeActions from '../actions/ide';
import getSortedSketches from '../selectors/projects';
import Loader from '../../App/components/loader';
import Overlay from '../../App/components/Overlay';
import AddToCollectionList from './AddToCollectionList';
import getConfig from '../../../utils/getConfig';

import ArrowUpIcon from '../../../images/sort-arrow-up.svg';
import ArrowDownIcon from '../../../images/sort-arrow-down.svg';
import DownFilledTriangleIcon from '../../../images/down-filled-triangle.svg';
import MoreIconSvg from '../../../images/more.svg';

const ROOT_URL = getConfig('API_URL');

const formatDateCell = (date, mobile = false) =>
  dates.format(date, { showTime: !mobile });

const SketchListRowBase = ({
  sketch,
  username,
  mobile,
  user,
  changeProjectName,
  cloneProject,
  showShareModal,
  deleteProject,
  onAddToCollection,
  handleRowClick,
  t
}) => {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(sketch.name);
  const [isFocused, setIsFocused] = useState(false);
  const renameInput = useRef(null);

  const closeAll = () => {
    setRenameOpen(false);
    setOptionsOpen(false);
  };

  const updateName = () => {
    const isValid = renameValue.trim().length !== 0;
    if (isValid) {
      changeProjectName(sketch.id, renameValue.trim());
    }
  };

  const onFocusComponent = () => {
    setIsFocused(true);
  };

  const onBlurComponent = () => {
    setIsFocused(false);
    setTimeout(() => {
      if (!isFocused) {
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

  const openRename = () => {
    setRenameOpen(true);
    setRenameValue(sketch.name);
    renameInput.current.focus();
  };

  const closeRename = () => {
    setRenameOpen(false);
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

  const resetSketchName = () => {
    setRenameValue(sketch.name);
    setRenameOpen(false);
  };

  const handleDropdownOpen = () => {
    closeAll();
    openOptions();
  };

  const handleRenameOpen = () => {
    closeAll();
    openRename();
  };

  const handleSketchDownload = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = `${ROOT_URL}/projects/${sketch.id}/zip`;
    downloadLink.download = `${sketch.name}.zip`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleSketchDuplicate = () => {
    closeAll();
    cloneProject(sketch);
  };

  const handleSketchShare = () => {
    closeAll();
    showShareModal(sketch.id, sketch.name, username);
  };

  const handleSketchDelete = () => {
    closeAll();
    if (
      window.confirm(
        t('Common.DeleteConfirmation', {
          name: sketch.name
        })
      )
    ) {
      deleteProject(sketch.id);
    }
  };

  const renderViewButton = (sketchURL) => (
    <td className="sketch-list__dropdown-column">
      <Link to={sketchURL}>{t('SketchList.View')}</Link>
    </td>
  );

  const renderDropdown = () => {
    const userIsOwner = user.username === username;

    return (
      <td className="sketch-list__dropdown-column">
        <button
          className="sketch-list__dropdown-button"
          onClick={toggleOptions}
          onBlur={onBlurComponent}
          onFocus={onFocusComponent}
          aria-label={t('SketchList.ToggleLabelARIA')}
        >
          {mobile ? (
            <MoreIconSvg focusable="false" aria-hidden="true" />
          ) : (
            <DownFilledTriangleIcon focusable="false" aria-hidden="true" />
          )}
        </button>
        {optionsOpen && (
          <ul className="sketch-list__action-dialogue">
            {userIsOwner && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={handleRenameOpen}
                  onBlur={onBlurComponent}
                  onFocus={onFocusComponent}
                >
                  {t('SketchList.DropdownRename')}
                </button>
              </li>
            )}
            <li>
              <button
                className="sketch-list__action-option"
                onClick={handleSketchDownload}
                onBlur={onBlurComponent}
                onFocus={onFocusComponent}
              >
                {t('SketchList.DropdownDownload')}
              </button>
            </li>
            {user.authenticated && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={handleSketchDuplicate}
                  onBlur={onBlurComponent}
                  onFocus={onFocusComponent}
                >
                  {t('SketchList.DropdownDuplicate')}
                </button>
              </li>
            )}
            {user.authenticated && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={() => {
                    onAddToCollection();
                    closeAll();
                  }}
                  onBlur={onBlurComponent}
                  onFocus={onFocusComponent}
                >
                  {t('SketchList.DropdownAddToCollection')}
                </button>
              </li>
            )}
            {/* <li>
              <button
                className="sketch-list__action-option"
                onClick={handleSketchShare}
                onBlur={onBlurComponent}
                onFocus={onFocusComponent}
              >
                Share
              </button>
            </li> */}
            {userIsOwner && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={handleSketchDelete}
                  onBlur={onBlurComponent}
                  onFocus={onFocusComponent}
                >
                  {t('SketchList.DropdownDelete')}
                </button>
              </li>
            )}
          </ul>
        )}
      </td>
    );
  };

  const url =
    username === 'p5'
      ? `/${username}/sketches/${slugify(sketch.name, '_')}`
      : `/${username}/sketches/${sketch.id}`;

  const name = (
    <React.Fragment>
      <Link to={url}>{renameOpen ? '' : sketch.name}</Link>
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
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <tr
        className="sketches-table__row"
        key={sketch.id}
        onClick={() => handleRowClick(sketch)}
      >
        <th scope="row">{name}</th>
        <td>{formatDateCell(sketch.createdAt, mobile)}</td>
        <td>{formatDateCell(sketch.updatedAt, mobile)}</td>
        {renderDropdown()}
      </tr>
    </React.Fragment>
  );
};

SketchListRowBase.propTypes = {
  sketch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  }).isRequired,
  username: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  deleteProject: PropTypes.func.isRequired,
  showShareModal: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  changeProjectName: PropTypes.func.isRequired,
  onAddToCollection: PropTypes.func.isRequired,
  mobile: PropTypes.bool,
  handleRowClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

SketchListRowBase.defaultProps = {
  mobile: false
};

const SketchList = ({
  user,
  getProjects,
  sketches,
  username,
  loading,
  toggleDirectionForField,
  resetSorting,
  sorting,
  mobile,
  t
}) => {
  getProjects(username);
  resetSorting();

  const [isInitialDataLoad, setIsInitialDataLoad] = useState(true);
  const [sketchToAddToCollection, setSketchToAddToCollection] = useState(null);

  React.useEffect(() => {
    if (Array.isArray(sketches)) {
      setIsInitialDataLoad(false);
    }
  }, [sketches]);

  const getSketchesTitle = () => {
    if (username === user.username) {
      return t('SketchList.Title');
    }
    return t('SketchList.AnothersTitle', {
      anotheruser: username
    });
  };

  const isLoading = () => loading && isInitialDataLoad;

  const hasSketches = () => !isLoading() && sketches.length > 0;

  const renderLoader = () => {
    if (isLoading()) return <Loader />;
    return null;
  };

  const renderEmptyTable = () => {
    if (!isLoading() && sketches.length === 0) {
      return (
        <p className="sketches-table__empty">{t('SketchList.NoSketches')}</p>
      );
    }
    return null;
  };

  const _getButtonLabel = (fieldName, displayName) => {
    const { field, direction } = sorting;
    let buttonLabel;
    if (field !== fieldName) {
      if (field === 'name') {
        buttonLabel = t('SketchList.ButtonLabelAscendingARIA', {
          displayName
        });
      } else {
        buttonLabel = t('SketchList.ButtonLabelDescendingARIA', {
          displayName
        });
      }
    } else if (direction === SortingActions.DIRECTION.ASC) {
      buttonLabel = t('SketchList.ButtonLabelDescendingARIA', {
        displayName
      });
    } else {
      buttonLabel = t('SketchList.ButtonLabelAscendingARIA', {
        displayName
      });
    }
    return buttonLabel;
  };

  const _renderFieldHeader = (fieldName, displayName) => {
    const { field, direction } = sorting;
    const headerClass = classNames({
      'sketches-table__header': true,
      'sketches-table__header--selected': field === fieldName
    });
    const buttonLabel = _getButtonLabel(fieldName, displayName);
    return (
      <th scope="col">
        <button
          className="sketch-list__sort-button"
          onClick={() => toggleDirectionForField(fieldName)}
          aria-label={buttonLabel}
        >
          <span className={headerClass}>{displayName}</span>
          {field === fieldName &&
            direction === SortingActions.DIRECTION.ASC && (
              <ArrowUpIcon
                role="img"
                aria-label={t('SketchList.DirectionAscendingARIA')}
                focusable="false"
              />
            )}
          {field === fieldName &&
            direction === SortingActions.DIRECTION.DESC && (
              <ArrowDownIcon
                role="img"
                aria-label={t('SketchList.DirectionDescendingARIA')}
                focusable="false"
              />
            )}
        </button>
      </th>
    );
  };

  return (
    <article className="sketches-table-container">
      <Helmet>
        <title>{getSketchesTitle()}</title>
      </Helmet>
      {renderLoader()}
      {renderEmptyTable()}
      {hasSketches() && (
        <table
          className="sketches-table"
          summary={t('SketchList.TableSummary')}
        >
          <thead>
            <tr>
              {_renderFieldHeader('name', t('SketchList.HeaderName'))}
              {_renderFieldHeader(
                'createdAt',
                t('SketchList.HeaderCreatedAt', {
                  context: mobile ? 'mobile' : ''
                })
              )}
              {_renderFieldHeader(
                'updatedAt',
                t('SketchList.HeaderUpdatedAt', {
                  context: mobile ? 'mobile' : ''
                })
              )}
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {sketches.map((sketch) => (
              <SketchListRowBase
                key={sketch.id}
                sketch={sketch}
                user={user}
                username={username}
                onAddToCollection={() => {
                  setSketchToAddToCollection(sketch);
                }}
                t={t}
              />
            ))}
          </tbody>
        </table>
      )}
      {sketchToAddToCollection && (
        <Overlay
          isFixedHeight
          title={t('SketchList.AddToCollectionOverlayTitle')}
          closeOverlay={() => setSketchToAddToCollection(null)}
        >
          <AddToCollectionList
            project={sketchToAddToCollection}
            username={username}
            user={user}
          />
        </Overlay>
      )}
    </article>
  );
};

SketchList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  getProjects: PropTypes.func.isRequired,
  sketches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired
    })
  ).isRequired,
  username: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  toggleDirectionForField: PropTypes.func.isRequired,
  resetSorting: PropTypes.func.isRequired,
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired,
  mobile: PropTypes.bool,
  t: PropTypes.func.isRequired
};

SketchList.defaultProps = {
  username: undefined,
  mobile: false
};

const mapStateToProps = (state) => ({
  user: state.user,
  sketches: getSortedSketches(state),
  sorting: state.sorting,
  loading: state.loading,
  project: state.project
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    Object.assign(
      {},
      ProjectsActions,
      CollectionsActions,
      ToastActions,
      SortingActions
    ),
    dispatch
  );

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(SketchList)
);
