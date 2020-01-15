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
import AddToCollectionSketchList from '../../IDE/components/AddToCollectionSketchList';
import CopyableInput from '../../IDE/components/CopyableInput';
import { SketchSearchbar } from '../../IDE/components/Searchbar';
import dropdownArrow from '../../../images/down-arrow.svg';

const arrowUp = require('../../../images/sort-arrow-up.svg');
const arrowDown = require('../../../images/sort-arrow-down.svg');
const removeIcon = require('../../../images/close.svg');

const ShareURL = ({ value }) => {
  const [showURL, setShowURL] = React.useState(false);

  return (
    <div className="collection-share">
      <button className="collection-share__button" onClick={() => setShowURL(!showURL)}>
        <span>Share</span>
        <InlineSVG className="collection-share__arrow" src={dropdownArrow} />
      </button>
      { showURL &&
        <div className="collection__share-dropdown">
          <CopyableInput value={value} label="Link to Collection" />
        </div>
      }
    </div>
  );
};

ShareURL.propTypes = {
  value: PropTypes.string.isRequired,
};

class CollectionItemRowBase extends React.Component {
  handleSketchRemove = () => {
    if (window.confirm(`Are you sure you want to remove "${this.props.item.project.name}" from this collection?`)) {
      this.props.removeFromCollection(this.props.collection.id, this.props.item.project.id);
    }
  }

  render() {
    const { item } = this.props;
    const sketchOwnerUsername = item.project.user.username;
    const sketchUrl = `/${item.project.user.username}/sketches/${item.project.id}`;

    return (
      <tr
        className="sketches-table__row"
      >
        <th scope="row">
          <Link to={sketchUrl}>
            {item.project.name}
          </Link>
        </th>
        <td>{format(new Date(item.createdAt), 'MMM D, YYYY h:mm A')}</td>
        <td>{sketchOwnerUsername}</td>
        <td className="collection-row__action-column ">
          <button
            className="collection-row__remove-button"
            onClick={this.handleSketchRemove}
          >
            <InlineSVG src={removeIcon} alt="Remove" />
          </button>
        </td>
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
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  removeFromCollection: PropTypes.func.isRequired
};

function mapDispatchToPropsSketchListRow(dispatch) {
  return bindActionCreators(Object.assign({}, CollectionsActions, ProjectActions, IdeActions), dispatch);
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

    if (this.props.user != null &&
      this.props.user.username &&
      this.props.collection.owner.username === this.props.user.username) {
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
      id, name, description, items, owner
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

    //
    // TODO: Implement UI for editing slug
    //
    // const handleEditCollectionSlug = (value) => {
    //   if (value === slug) {
    //     return;
    //   }
    //
    //   this.props.editCollection(id, { slug: value });
    // };

    return (
      <div className={`collection-metadata ${this.isOwner() ? 'collection-metadata--is-owner' : ''}`}>
        <div className="collection-metadata__columns">
          <div className="collection-metadata__column--left">
            <h2 className="collection-metadata__name">
              {
                this.isOwner() ? <EditableInput value={name} onChange={handleEditCollectionName} /> : name
              }
            </h2>

            <p className="collection-metadata__description">
              {
                this.isOwner() ?
                  <EditableInput
                    InputComponent="textarea"
                    value={description}
                    onChange={handleEditCollectionDescription}
                    emptyPlaceholder="Add description"
                  /> :
                  description
              }
            </p>

            <p className="collection-metadata__user">Collection by{' '}
              <Link to={`${hostname}/${username}/sketches`}>{owner.username}</Link>
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
    const isLoading = this.props.loading;
    const hasCollectionItems = this.props.collection != null &&
      this.props.collection.items.length > 0;

    if (!isLoading && !hasCollectionItems) {
      return (<p className="collection-empty-message">No sketches in collection</p>);
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
      <section className="collection-container" data-has-items={this.hasCollectionItems() ? 'true' : 'false'}>
        <Helmet>
          <title>{this.getTitle()}</title>
        </Helmet>
        {this._renderLoader()}
        {this.hasCollection() && this._renderCollectionMetadata()}
        <div className="collection-table-wrapper">
          {this._renderEmptyTable()}
          {this.hasCollectionItems() &&
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
                    collection={this.props.collection}
                  />))}
              </tbody>
            </table>
          }
          {
            this.state.isAddingSketches && (
              <Overlay
                title="Add sketch"
                actions={<SketchSearchbar />}
                closeOverlay={this.hideAddSketches}
                isFixedHeight
              >
                <div className="collection-add-sketch">
                  <AddToCollectionSketchList username={this.props.username} collection={this.props.collection} />
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
  return bindActionCreators(
    Object.assign({}, CollectionsActions, ProjectsActions, ToastActions, SortingActions),
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Collection);
