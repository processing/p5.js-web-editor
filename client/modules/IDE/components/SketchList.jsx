import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Link } from 'react-router';
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

import ArrowUpIcon from '../../../images/sort-arrow-up.svg';
import ArrowDownIcon from '../../../images/sort-arrow-down.svg';
import DownFilledTriangleIcon from '../../../images/down-filled-triangle.svg';

const formatDateCell = (date, mobile = false) =>
  dates.format(date, { showTime: !mobile });

class SketchListRowBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      optionsOpen: false,
      renameOpen: false,
      renameValue: props.sketch.name,
      isFocused: false
    };
    this.renameInput = React.createRef();
  }

  onFocusComponent = () => {
    this.setState({ isFocused: true });
  };

  onBlurComponent = () => {
    this.setState({ isFocused: false });
    setTimeout(() => {
      if (!this.state.isFocused) {
        this.closeAll();
      }
    }, 200);
  };

  openOptions = () => {
    this.setState({
      optionsOpen: true
    });
  };

  closeOptions = () => {
    this.setState({
      optionsOpen: false
    });
  };

  toggleOptions = () => {
    if (this.state.optionsOpen) {
      this.closeOptions();
    } else {
      this.openOptions();
    }
  };

  openRename = () => {
    this.setState(
      {
        renameOpen: true,
        renameValue: this.props.sketch.name
      },
      () => this.renameInput.current.focus()
    );
  };

  closeRename = () => {
    this.setState({
      renameOpen: false
    });
  };

  closeAll = () => {
    this.setState({
      renameOpen: false,
      optionsOpen: false
    });
  };

  handleRenameChange = (e) => {
    this.setState({
      renameValue: e.target.value
    });
  };

  handleRenameEnter = (e) => {
    if (e.key === 'Enter') {
      this.updateName();
      this.closeAll();
    }
  };

  handleRenameBlur = () => {
    this.updateName();
    this.closeAll();
  };

  updateName = () => {
    const isValid = this.state.renameValue.trim().length !== 0;
    if (isValid) {
      this.props.changeProjectName(
        this.props.sketch.id,
        this.state.renameValue.trim()
      );
    }
  };

  resetSketchName = () => {
    this.setState({
      renameValue: this.props.sketch.name,
      renameOpen: false
    });
  };

  handleDropdownOpen = () => {
    this.closeAll();
    this.openOptions();
  };

  handleRenameOpen = () => {
    this.closeAll();
    this.openRename();
  };

  handleSketchDownload = () => {
    this.props.exportProjectAsZip(this.props.sketch.id);
  };

  handleSketchDuplicate = () => {
    this.closeAll();
    this.props.cloneProject(this.props.sketch);
  };

  handleSketchShare = () => {
    this.closeAll();
    this.props.showShareModal(
      this.props.sketch.id,
      this.props.sketch.name,
      this.props.username
    );
  };

  handleSketchDelete = () => {
    this.closeAll();
    if (
      window.confirm(
        this.props.t('Common.DeleteConfirmation', {
          name: this.props.sketch.name
        })
      )
    ) {
      this.props.deleteProject(this.props.sketch.id);
    }
  };

  renderViewButton = (sketchURL) => (
    <td className="sketch-list__dropdown-column">
      <Link to={sketchURL}>{this.props.t('SketchList.View')}</Link>
    </td>
  );

  renderDropdown = () => {
    const { optionsOpen } = this.state;
    const userIsOwner = this.props.user.username === this.props.username;
    return (
      <td className="sketch-list__dropdown-column">
        <button
          className="sketch-list__dropdown-button"
          onClick={this.toggleOptions}
          onBlur={this.onBlurComponent}
          onFocus={this.onFocusComponent}
          aria-label={this.props.t('SketchList.ToggleLabelARIA')}
          data-testid="sketch-list-toggle-options-arrow"
        >
          <DownFilledTriangleIcon focusable="false" aria-hidden="true" />
        </button>
        {optionsOpen && (
          <ul className="sketch-list__action-dialogue">
            {userIsOwner && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleRenameOpen}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  {this.props.t('SketchList.DropdownRename')}
                </button>
              </li>
            )}
            <li>
              <button
                className="sketch-list__action-option"
                onClick={this.handleSketchDownload}
                onBlur={this.onBlurComponent}
                onFocus={this.onFocusComponent}
              >
                {this.props.t('SketchList.DropdownDownload')}
              </button>
            </li>
            {this.props.user.authenticated && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleSketchDuplicate}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  {this.props.t('SketchList.DropdownDuplicate')}
                </button>
              </li>
            )}
            {this.props.user.authenticated && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={() => {
                    this.props.onAddToCollection();
                    this.closeAll();
                  }}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  {this.props.t('SketchList.DropdownAddToCollection')}
                </button>
              </li>
            )}
            {/* <li>
              <button
                className="sketch-list__action-option"
                onClick={this.handleSketchShare}
                onBlur={this.onBlurComponent}
                onFocus={this.onFocusComponent}
              >
                Share
              </button>
            </li> */}
            {userIsOwner && (
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleSketchDelete}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  {this.props.t('SketchList.DropdownDelete')}
                </button>
              </li>
            )}
          </ul>
        )}
      </td>
    );
  };

  render() {
    const { sketch, username, mobile } = this.props;
    const { renameOpen, renameValue } = this.state;
    let url = `/${username}/sketches/${sketch.id}`;
    if (username === 'p5') {
      url = `/${username}/sketches/${slugify(sketch.name, '_')}`;
    }

    const name = (
      <React.Fragment>
        <Link to={url}>{renameOpen ? '' : sketch.name}</Link>
        {renameOpen && (
          <input
            value={renameValue}
            onChange={this.handleRenameChange}
            onKeyUp={this.handleRenameEnter}
            onBlur={this.handleRenameBlur}
            onClick={(e) => e.stopPropagation()}
            ref={this.renameInput}
          />
        )}
      </React.Fragment>
    );

    return (
      <React.Fragment>
        <tr
          className="sketches-table__row"
          key={sketch.id}
          onClick={this.handleRowClick}
        >
          <th scope="row">{name}</th>
          <td>
            {mobile && 'Created: '}
            {formatDateCell(sketch.createdAt, mobile)}
          </td>
          <td>
            {mobile && 'Updated: '}
            {formatDateCell(sketch.updatedAt, mobile)}
          </td>
          {this.renderDropdown()}
        </tr>
      </React.Fragment>
    );
  }
}

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
  exportProjectAsZip: PropTypes.func.isRequired,
  changeProjectName: PropTypes.func.isRequired,
  onAddToCollection: PropTypes.func.isRequired,
  mobile: PropTypes.bool,
  t: PropTypes.func.isRequired
};

SketchListRowBase.defaultProps = {
  mobile: false
};

function mapDispatchToPropsSketchListRow(dispatch) {
  return bindActionCreators(
    Object.assign({}, ProjectActions, IdeActions),
    dispatch
  );
}

const SketchListRow = connect(
  null,
  mapDispatchToPropsSketchListRow
)(SketchListRowBase);

class SketchList extends React.Component {
  constructor(props) {
    super(props);
    this.props.getProjects(this.props.username);
    this.props.resetSorting();

    this.state = {
      isInitialDataLoad: true
    };
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.sketches !== prevProps.sketches &&
      Array.isArray(this.props.sketches)
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        isInitialDataLoad: false
      });
    }
  }

  getSketchesTitle() {
    if (this.props.username === this.props.user.username) {
      return this.props.t('SketchList.Title');
    }
    return this.props.t('SketchList.AnothersTitle', {
      anotheruser: this.props.username
    });
  }

  hasSketches() {
    return !this.isLoading() && this.props.sketches.length > 0;
  }

  isLoading() {
    return this.props.loading && this.state.isInitialDataLoad;
  }

  _renderLoader() {
    if (this.isLoading()) return <Loader />;
    return null;
  }

  _renderEmptyTable() {
    if (!this.isLoading() && this.props.sketches.length === 0) {
      return (
        <p className="sketches-table__empty">
          {this.props.t('SketchList.NoSketches')}
        </p>
      );
    }
    return null;
  }

  _getButtonLabel = (fieldName, displayName) => {
    const { field, direction } = this.props.sorting;
    let buttonLabel;
    if (field !== fieldName) {
      if (field === 'name') {
        buttonLabel = this.props.t('SketchList.ButtonLabelAscendingARIA', {
          displayName
        });
      } else {
        buttonLabel = this.props.t('SketchList.ButtonLabelDescendingARIA', {
          displayName
        });
      }
    } else if (direction === SortingActions.DIRECTION.ASC) {
      buttonLabel = this.props.t('SketchList.ButtonLabelDescendingARIA', {
        displayName
      });
    } else {
      buttonLabel = this.props.t('SketchList.ButtonLabelAscendingARIA', {
        displayName
      });
    }
    return buttonLabel;
  };

  _renderFieldHeader = (fieldName, displayName) => {
    const { field, direction } = this.props.sorting;
    const headerClass = classNames({
      'sketches-table__header': true,
      'sketches-table__header--selected': field === fieldName
    });
    const buttonLabel = this._getButtonLabel(fieldName, displayName);
    return (
      <th scope="col">
        <button
          className="sketch-list__sort-button"
          onClick={() => this.props.toggleDirectionForField(fieldName)}
          aria-label={buttonLabel}
          data-testid={`toggle-direction-${fieldName}`}
        >
          <span className={headerClass}>{displayName}</span>
          {field === fieldName &&
            direction === SortingActions.DIRECTION.ASC && (
              <ArrowUpIcon
                role="img"
                aria-label={this.props.t('SketchList.DirectionAscendingARIA')}
                focusable="false"
              />
            )}
          {field === fieldName &&
            direction === SortingActions.DIRECTION.DESC && (
              <ArrowDownIcon
                role="img"
                aria-label={this.props.t('SketchList.DirectionDescendingARIA')}
                focusable="false"
              />
            )}
        </button>
      </th>
    );
  };

  render() {
    const username =
      this.props.username !== undefined
        ? this.props.username
        : this.props.user.username;
    const { mobile } = this.props;
    return (
      <article className="sketches-table-container">
        <Helmet>
          <title>{this.getSketchesTitle()}</title>
        </Helmet>
        {this._renderLoader()}
        {this._renderEmptyTable()}
        {this.hasSketches() && (
          <table
            className="sketches-table"
            summary={this.props.t('SketchList.TableSummary')}
          >
            <thead>
              <tr>
                {this._renderFieldHeader(
                  'name',
                  this.props.t('SketchList.HeaderName')
                )}
                {this._renderFieldHeader(
                  'createdAt',
                  this.props.t('SketchList.HeaderCreatedAt', {
                    context: mobile ? 'mobile' : ''
                  })
                )}
                {this._renderFieldHeader(
                  'updatedAt',
                  this.props.t('SketchList.HeaderUpdatedAt', {
                    context: mobile ? 'mobile' : ''
                  })
                )}
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {this.props.sketches.map((sketch) => (
                <SketchListRow
                  mobile={mobile}
                  key={sketch.id}
                  sketch={sketch}
                  user={this.props.user}
                  username={username}
                  onAddToCollection={() => {
                    this.setState({ sketchToAddToCollection: sketch });
                  }}
                  t={this.props.t}
                />
              ))}
            </tbody>
          </table>
        )}
        {this.state.sketchToAddToCollection && (
          <Overlay
            isFixedHeight
            title={this.props.t('SketchList.AddToCollectionOverlayTitle')}
            closeOverlay={() =>
              this.setState({ sketchToAddToCollection: null })
            }
          >
            <AddToCollectionList
              project={this.state.sketchToAddToCollection}
              username={this.props.username}
              user={this.props.user}
            />
          </Overlay>
        )}
      </article>
    );
  }
}

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

function mapStateToProps(state) {
  return {
    user: state.user,
    sketches: getSortedSketches(state),
    sorting: state.sorting,
    loading: state.loading,
    project: state.project
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign(
      {},
      ProjectsActions,
      CollectionsActions,
      ToastActions,
      SortingActions
    ),
    dispatch
  );
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(SketchList)
);
