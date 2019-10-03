import format from 'date-fns/format';
import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import InlineSVG from 'react-inlinesvg';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import * as ProjectActions from '../../IDE/actions/project';
import * as ProjectsActions from '../../IDE/actions/projects';
import * as CollectionsActions from '../../IDE/actions/collections';
import * as ToastActions from '../../IDE/actions/toast';
import * as SortingActions from '../../IDE/actions/sorting';
import * as IdeActions from '../../IDE/actions/ide';
import { getCollection } from '../../IDE/selectors/collections';
import Loader from '../../App/components/loader';
import EditableInput from '../../IDE/components/EditableInput';
import Overlay from '../../App/components/Overlay';
import SketchList from '../../IDE/components/SketchList';
import CopyableInput from '../../IDE/components/CopyableInput';

const arrowUp = require('../../../images/sort-arrow-up.svg');
const arrowDown = require('../../../images/sort-arrow-down.svg');
const downFilledTriangle = require('../../../images/down-filled-triangle.svg');

const ShareURL = ({ value }) => {
  const [showURL, setShowURL] = React.useState(false);

  return (
    <div className="collection-share">
      {
        showURL ?
          <React.Fragment>
            <span className="collection-share__label">Everyone can access the collection with this link</span>
            <br />
            <CopyableInput value={value} />
          </React.Fragment> :
          <button className="collection-share__button" onClick={() => setShowURL(true)}>Share</button>
      }
    </div>
  );
};

ShareURL.propTypes = {
  value: PropTypes.string.isRequired,
};

class CollectionItemRowBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      optionsOpen: false,
      renameOpen: false,
      renameValue: props.item.project.name,
      isFocused: false
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
      this.props.changeProjectName(this.props.collection.id, this.state.renameValue);
      this.closeAll();
    }
  }

  resetSketchName = () => {
    this.setState({
      renameValue: this.props.collection.name
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
    this.props.exportProjectAsZip(this.props.collection.id);
  }

  handleSketchDuplicate = () => {
    this.closeAll();
    this.props.cloneProject(this.props.collection.id);
  }

  handleSketchShare = () => {
    this.closeAll();
    this.props.showShareModal(this.props.collection.id, this.props.collection.name, this.props.username);
  }

  handleSketchDelete = () => {
    this.closeAll();
    if (window.confirm(`Are you sure you want to delete "${this.props.collection.name}"?`)) {
      this.props.deleteProject(this.props.collection.id);
    }
  }

  render() {
    const { item, username } = this.props;
    const { renameOpen, optionsOpen, renameValue } = this.state;
    const sketchOwnerUsername = item.project.user.username;
    const userIsOwner = this.props.user.username === sketchOwnerUsername;
    const sketchUrl = `/${item.project.user.username}/sketches/${item.project.id}`;

    const dropdown = (
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
                  onClick={this.handleSketchDelete}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  Delete
                </button>
              </li>}
          </ul>
        }
      </td>
    );

    return (
      <tr
        className="sketches-table__row"
      >
        <th scope="row">
          <Link to={sketchUrl}>
            {renameOpen ? '' : item.project.name}
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
        </th>
        <td>{format(new Date(item.createdAt), 'MMM D, YYYY h:mm A')}</td>
        <td>{sketchOwnerUsername}</td>
        {/*
        <td>{format(new Date(item.createdAt), 'MMM D, YYYY h:mm A')}</td>
        <td>{format(new Date(itm.updatedAt), 'MMM D, YYYY h:mm A')}</td>
        <td>{(collection.items || []).length}</td>
        <td>{dropdown}</td>
        */}
      </tr>);
  }
}

CollectionItemRowBase.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  item: PropTypes.shape({
    project: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
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
  changeProjectName: PropTypes.func.isRequired
};

function mapDispatchToPropsSketchListRow(dispatch) {
  return bindActionCreators(Object.assign({}, ProjectActions, IdeActions), dispatch);
}

const CollectionItemRow = connect(null, mapDispatchToPropsSketchListRow)(CollectionItemRowBase);

class Collection extends React.Component {
  constructor(props) {
    super(props);
    this.props.getCollections(this.props.username);
    this.props.resetSorting();
    this._renderFieldHeader = this._renderFieldHeader.bind(this);
    this.showAddSketches = this.showAddSketches.bind(this);
    this.hideAddSketches = this.hideAddSketches.bind(this);

    this.state = {
      isAddingSketches: false,
    };
  }

  getTitle() {
    if (this.props.username === this.props.user.username) {
      return 'p5.js Web Editor | My collections';
    }
    return `p5.js Web Editor | ${this.props.username}'s collections`;
  }

  getUsername() {
    return this.props.username !== undefined ? this.props.username : this.props.user.username;
  }

  getCollectionName() {
    return this.props.collection.name;
  }

  isOwner() {
    let isOwner = false;

    if (this.props.user != null && this.props.user.username && this.props.collection.owner.username === this.props.user.username) {
      isOwner = true;
    }

    return isOwner;
  }

  hasCollection() {
    return !this.props.loading && this.props.collection != null;
  }

  hasCollectionItems() {
    return this.hasCollection() && this.props.collection.items.length > 0;
  }

  _renderLoader() {
    if (this.props.loading) return <Loader />;
    return null;
  }

  _renderCollectionMetadata() {
    const {
      id, name, description, items, owner, slug
    } = this.props.collection;

    const hostname = window.location.origin;
    const { username } = this.props;

    const baseURL = `${hostname}/${username}/collections/`;

    const handleEditCollectionName = (value) => {
      if (value === name) {
        return;
      }

      this.props.editCollection(id, { name: value });
    };

    const handleEditCollectionDescription = (value) => {
      if (value === description) {
        return;
      }

      this.props.editCollection(id, { description: value });
    };

    const handleEditCollectionSlug = (value) => {
      if (value === slug) {
        return;
      }

      this.props.editCollection(id, { slug: value });
    };

    return (
      <div className="collection-metadata">
        <div className="collection-metadata__columns">
          <div className="collection-metadata__column--left">
            <h2 className="collection-metadata__name">
              {
                this.isOwner() ? <EditableInput value={name} onChange={handleEditCollectionName} /> : name
              }
            </h2>

            <p className="collection-metadata__user">By {owner.username}</p>

            <p className="collection-metadata__description">
              {
                this.isOwner() ?
                  <EditableInput
                    InputComponent="textarea"
                    value={description}
                    onChange={handleEditCollectionDescription}
                  /> :
                  description
              }
            </p>

            <p className="collection-metadata__user">{items.length} sketch{items.length === 1 ? '' : 'es'}</p>
          </div>

          <div className="collection-metadata__column--right">
            <p className="collection-metadata__share">
              <ShareURL value={`${baseURL}${id}`} />
            </p>
            {
              this.isOwner() &&
              <button className="collection-metadata__add-button" onClick={this.showAddSketches}>
                Add Sketch
              </button>
            }
          </div>
        </div>
      </div>
    );
  }

  showAddSketches() {
    this.setState({
      isAddingSketches: true,
    });
  }

  hideAddSketches() {
    this.setState({
      isAddingSketches: false,
    });
  }

  _renderEmptyTable() {
    if (!this.hasCollectionItems()) {
      return (<p className="sketches-table__empty">No sketches in collection. <button onClick={this.showAddSketches}>Add some sketches</button></p>);
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

  render() {
    const title = this.hasCollection() ? this.getCollectionName() : null;

    return (
      <section className="collection-container">
        <Helmet>
          <title>{this.getTitle()}</title>
        </Helmet>
        <div className="">
          {this._renderLoader()}
          {this.hasCollection() && this._renderCollectionMetadata()}
          {this._renderEmptyTable()}
          {this.hasCollectionItems() &&
            <div className="collection-table-wrapper">
              <table className="sketches-table" summary="table containing all collections">
                <thead>
                  <tr>
                    {this._renderFieldHeader('name', 'Name')}
                    {this._renderFieldHeader('createdAt', 'Date Added')}
                    {this._renderFieldHeader('user', 'Owner')}
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.collection.items.map(item =>
                    (<CollectionItemRow
                      key={item.id}
                      item={item}
                      user={this.props.user}
                      username={this.getUsername()}
                    />))}
                </tbody>
              </table>
            </div>
          }
          {
            this.state.isAddingSketches && (
              <Overlay title="Add sketches" closeOverlay={this.hideAddSketches}>
                <div className="collection-add-sketch">
                  <SketchList username={this.props.username} addMode collection={this.props.collection} />
                </div>
              </Overlay>
            )
          }
        </div>
      </section>
    );
  }
}

Collection.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  getCollections: PropTypes.func.isRequired,
  collection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string,
    description: PropTypes.string,
    owner: PropTypes.shape({
      username: PropTypes.string.isRequired,
    }).isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  username: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  toggleDirectionForField: PropTypes.func.isRequired,
  editCollection: PropTypes.func.isRequired,
  resetSorting: PropTypes.func.isRequired,
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired
};

Collection.defaultProps = {
  username: undefined
};

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
    collection: getCollection(state, ownProps.collectionId),
    sorting: state.sorting,
    loading: state.loading,
    project: state.project
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, CollectionsActions, ProjectsActions, ToastActions, SortingActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Collection);
