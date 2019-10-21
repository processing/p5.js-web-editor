import format from 'date-fns/format';
import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import InlineSVG from 'react-inlinesvg';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import slugify from 'slugify';
import * as ProjectActions from '../actions/project';
import * as ProjectsActions from '../actions/projects';
import * as CollectionsActions from '../actions/collections';
import * as ToastActions from '../actions/toast';
import * as SortingActions from '../actions/sorting';
import * as IdeActions from '../actions/ide';
import getSortedSketches from '../selectors/projects';
import Loader from '../../App/components/loader';
import CollectionPopover from './CollectionPopover';

const arrowUp = require('../../../images/sort-arrow-up.svg');
const arrowDown = require('../../../images/sort-arrow-down.svg');
const downFilledTriangle = require('../../../images/down-filled-triangle.svg');
const check = require('../../../images/check.svg');

const checkIcon = (
  <InlineSVG className="sketch-list__check-icon" src={check} alt="In collection" />
);

class SketchListRowBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      optionsOpen: false,
      renameOpen: false,
      renameValue: props.sketch.name,
      isFocused: false,
      showPopover: false,
    };
  }

  onFocusComponent = () => {
    this.setState({ isFocused: true });
  }

  onBlurComponent = () => {
    this.setState({ isFocused: false });
    setTimeout(() => {
      if (!this.state.isFocused) {
        this.closeAll();
      }
    }, 200);
  }

  openOptions = () => {
    this.setState({
      optionsOpen: true
    });
  }

  closeOptions = () => {
    this.setState({
      optionsOpen: false
    });
  }

  toggleOptions = () => {
    if (this.state.optionsOpen) {
      this.closeOptions();
    } else {
      this.openOptions();
    }
  }

  openRename = () => {
    this.setState({
      renameOpen: true
    });
  }

  closeRename = () => {
    this.setState({
      renameOpen: false
    });
  }

  closeAll = () => {
    this.setState({
      renameOpen: false,
      optionsOpen: false
    });
  }

  handleRenameChange = (e) => {
    this.setState({
      renameValue: e.target.value
    });
  }

  handleRenameEnter = (e) => {
    if (e.key === 'Enter') {
      // TODO pass this func
      this.props.changeProjectName(this.props.sketch.id, this.state.renameValue);
      this.closeAll();
    }
  }

  resetSketchName = () => {
    this.setState({
      renameValue: this.props.sketch.name
    });
  }

  handleDropdownOpen = () => {
    this.closeAll();
    this.openOptions();
  }

  handleRenameOpen = () => {
    this.closeAll();
    this.openRename();
  }

  handleSketchDownload = () => {
    this.props.exportProjectAsZip(this.props.sketch.id);
  }

  handleShowCollectionPopover = () => {
    this.setState({
      showPopover: true
    });
  }

  handleCloseCollectionPopover = () => {
    this.setState({
      showPopover: false
    });
  }

  handleSketchDuplicate = () => {
    this.closeAll();
    this.props.cloneProject(this.props.sketch.id);
  }

  handleSketchShare = () => {
    this.closeAll();
    this.props.showShareModal(this.props.sketch.id, this.props.sketch.name, this.props.username);
  }

  handleSketchDelete = () => {
    this.closeAll();
    if (window.confirm(`Are you sure you want to delete "${this.props.sketch.name}"?`)) {
      this.props.deleteProject(this.props.sketch.id);
    }
  }

  handleRowClick = (evt) => {
    if (!this.props.addMode) {
      return;
    }

    if (this.props.inCollection) {
      this.props.onCollectionRemove();
    } else {
      this.props.onCollectionAdd();
    }
  }

  renderViewButton = sketchURL => (
    <td className="sketch-list__dropdown-column">{
      <Link to={sketchURL}>View</Link>
    }
    </td>
  )

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
        >
          <InlineSVG src={downFilledTriangle} alt="Menu" />
        </button>
        {optionsOpen &&
          <ul
            className="sketch-list__action-dialogue"
          >
            {userIsOwner &&
            <li>
              <button
                className="sketch-list__action-option"
                onClick={this.handleRenameOpen}
                onBlur={this.onBlurComponent}
                onFocus={this.onFocusComponent}
              >
                Rename
              </button>
            </li>}
            <li>
              <button
                className="sketch-list__action-option"
                onClick={this.handleSketchDownload}
                onBlur={this.onBlurComponent}
                onFocus={this.onFocusComponent}
              >
                Download
              </button>
            </li>
            {this.props.user.authenticated &&
            <li>
              <button
                className="sketch-list__action-option"
                onClick={this.handleSketchDuplicate}
                onBlur={this.onBlurComponent}
                onFocus={this.onFocusComponent}
              >
                Duplicate
              </button>
            </li>}
            {this.props.user.authenticated &&
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleShowCollectionPopover}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  Add to collection
                </button>
              </li>}
            { /* <li>
              <button
                className="sketch-list__action-option"
                onClick={this.handleSketchShare}
                onBlur={this.onBlurComponent}
                onFocus={this.onFocusComponent}
              >
                Share
              </button>
            </li> */ }
            {userIsOwner &&
            <li>
              <button
                className="sketch-list__action-option"
                onClick={this.handleSketchDelete}
                onBlur={this.onBlurComponent}
                onFocus={this.onFocusComponent}
              >
                Delete
              </button>
            </li>}
          </ul>}
        {this.state.showPopover &&
          <CollectionPopover
            onClose={this.handleCloseCollectionPopover}
            project={this.props.sketch}
          />
        }
      </td>
    );
  }

  renderActions = sketchURL => (this.props.addMode === true ? this.renderViewButton(sketchURL) : this.renderDropdown())

  render() {
    const {
      sketch,
      username,
      addMode,
      inCollection,
    } = this.props;
    const { renameOpen, renameValue } = this.state;
    let url = `/${username}/sketches/${sketch.id}`;
    if (username === 'p5') {
      url = `/${username}/sketches/${slugify(sketch.name, '_')}`;
    }

    const name = addMode ?
      <span className="sketches-table__name">{inCollection ? checkIcon : null} {sketch.name}</span>
      : (
        <React.Fragment>
          <Link to={url}>
            {renameOpen ? '' : sketch.name}
          </Link>
          {renameOpen
          &&
          <input
            value={renameValue}
            onChange={this.handleRenameChange}
            onKeyUp={this.handleRenameEnter}
            onBlur={this.resetSketchName}
            onClick={e => e.stopPropagation()}
          />
          }
        </React.Fragment>
      );

    return (
      <React.Fragment>
        <tr
          className={`sketches-table__row ${addMode ? 'sketches-table__row--is-add-mode' : ''}`}
          key={sketch.id}
          onClick={this.handleRowClick}
        >
          <th scope="row">
            {name}
          </th>
          <td>{format(new Date(sketch.createdAt), 'MMM D, YYYY h:mm A')}</td>
          <td>{format(new Date(sketch.updatedAt), 'MMM D, YYYY h:mm A')}</td>
          {this.renderActions(url)}
        </tr>
      </React.Fragment>);
  }
}

SketchListRowBase.propTypes = {
  addMode: PropTypes.bool.isRequired,
  inCollection: PropTypes.bool.isRequired,
  sketch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
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
  onCollectionAdd: PropTypes.func.isRequired,
  onCollectionRemove: PropTypes.func.isRequired,
};

function mapDispatchToPropsSketchListRow(dispatch) {
  return bindActionCreators(Object.assign({}, ProjectActions, IdeActions), dispatch);
}

const SketchListRow = connect(null, mapDispatchToPropsSketchListRow)(SketchListRowBase);

class SketchList extends React.Component {
  constructor(props) {
    super(props);
    this.props.getProjects(this.props.username);
    this.props.resetSorting();
    this._renderFieldHeader = this._renderFieldHeader.bind(this);

    this.state = {
      isInitialDataLoad: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.sketches !== nextProps.sketches && Array.isArray(nextProps.sketches)) {
      this.setState({
        isInitialDataLoad: false,
      });
    }
  }

  getSketchesTitle() {
    if (this.props.username === this.props.user.username) {
      return 'p5.js Web Editor | My sketches';
    }
    return `p5.js Web Editor | ${this.props.username}'s sketches`;
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
      return (<p className="sketches-table__empty">No sketches.</p>);
    }
    return null;
  }

  _renderFieldHeader(fieldName, displayName) {
    const { field, direction } = this.props.sorting;
    const headerClass = classNames({
      'sketches-table__header': true,
      'sketches-table__header--selected': field === fieldName
    });
    return (
      <th scope="col">
        <button className="sketch-list__sort-button" onClick={() => this.props.toggleDirectionForField(fieldName)}>
          <span className={headerClass}>{displayName}</span>
          {field === fieldName && direction === SortingActions.DIRECTION.ASC &&
            <InlineSVG src={arrowUp} />
          }
          {field === fieldName && direction === SortingActions.DIRECTION.DESC &&
            <InlineSVG src={arrowDown} />
          }
        </button>
      </th>
    );
  }

  handleCollectionAdd = (sketchId) => {
    this.props.addToCollection(this.props.collection.id, sketchId);
  }

  handleCollectionRemove = (sketchId) => {
    this.props.removeFromCollection(this.props.collection.id, sketchId);
  }

  render() {
    const username = this.props.username !== undefined ? this.props.username : this.props.user.username;
    return (
      <div className="sketches-table-container">
        <Helmet>
          <title>{this.getSketchesTitle()}</title>
        </Helmet>
        {this._renderLoader()}
        {this._renderEmptyTable()}
        {this.hasSketches() &&
          <table className="sketches-table" summary="table containing all saved projects">
            <thead>
              <tr>
                {this._renderFieldHeader('name', 'Sketch')}
                {this._renderFieldHeader('createdAt', 'Date Created')}
                {this._renderFieldHeader('updatedAt', 'Date Updated')}
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {this.props.sketches.map(sketch =>
                (<SketchListRow
                  key={sketch.id}
                  sketch={sketch}
                  user={this.props.user}
                  username={username}
                  addMode={this.props.addMode}
                  onCollectionAdd={() => this.handleCollectionAdd(sketch.id)}
                  onCollectionRemove={() => this.handleCollectionRemove(sketch.id)}
                  inCollection={this.props.collection &&
                    this.props.collection.items.find(item => item.project.id === sketch.id) != null}
                />))}
            </tbody>
          </table>}
      </div>
    );
  }
}

SketchList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  getProjects: PropTypes.func.isRequired,
  sketches: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  })).isRequired,
  collection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      project: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }),
    })),
  }).isRequired,
  username: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  toggleDirectionForField: PropTypes.func.isRequired,
  resetSorting: PropTypes.func.isRequired,
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired,
  addToCollection: PropTypes.func.isRequired,
  removeFromCollection: PropTypes.func.isRequired,
  addMode: PropTypes.bool,
};

SketchList.defaultProps = {
  addMode: false,
  username: undefined
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
    Object.assign({}, ProjectsActions, CollectionsActions, ToastActions, SortingActions),
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(SketchList);
