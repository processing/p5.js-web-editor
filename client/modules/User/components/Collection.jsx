import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { useTranslation, withTranslation } from 'react-i18next';
import classNames from 'classnames';

import * as ProjectActions from '../../IDE/actions/project';
import * as ProjectsActions from '../../IDE/actions/projects';
import * as CollectionsActions from '../../IDE/actions/collections';
import * as ToastActions from '../../IDE/actions/toast';
import * as SortingActions from '../../IDE/actions/sorting';
import * as IdeActions from '../../IDE/actions/ide';
import { getCollection } from '../../IDE/selectors/collections';
import Loader from '../../App/components/loader';
import dates from '../../../utils/formatDate';

import ArrowUpIcon from '../../../images/sort-arrow-up.svg';
import ArrowDownIcon from '../../../images/sort-arrow-down.svg';
import RemoveIcon from '../../../images/close.svg';
import CollectionMetadata from './CollectionMetadata';

const CollectionItemRowBase = ({
  collection,
  item,
  isOwner,
  removeFromCollection
}) => {
  const { t } = useTranslation();

  const projectIsDeleted = item.isDeleted;

  const handleSketchRemove = () => {
    const name = projectIsDeleted ? 'deleted sketch' : item.project.name;

    if (
      window.confirm(
        t('Collection.DeleteFromCollection', { name_sketch: name })
      )
    ) {
      removeFromCollection(collection.id, item.projectId);
    }
  };

  const name = projectIsDeleted ? (
    <span>{t('Collection.SketchDeleted')}</span>
  ) : (
    <Link to={`/${item.project.user.username}/sketches/${item.projectId}`}>
      {item.project.name}
    </Link>
  );

  const sketchOwnerUsername = projectIsDeleted
    ? null
    : item.project.user.username;

  return (
    <tr
      className={`sketches-table__row ${projectIsDeleted ? 'is-deleted' : ''}`}
    >
      <th scope="row">{name}</th>
      <td>{dates.format(item.createdAt)}</td>
      <td>{sketchOwnerUsername}</td>
      <td className="collection-row__action-column ">
        {isOwner && (
          <button
            className="collection-row__remove-button"
            onClick={handleSketchRemove}
            aria-label={t('Collection.SketchRemoveARIA')}
          >
            <RemoveIcon focusable="false" aria-hidden="true" />
          </button>
        )}
      </td>
    </tr>
  );
};

CollectionItemRowBase.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  item: PropTypes.shape({
    createdAt: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    isDeleted: PropTypes.bool.isRequired,
    project: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      user: PropTypes.shape({
        username: PropTypes.string.isRequired
      })
    }).isRequired
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  removeFromCollection: PropTypes.func.isRequired
};

function mapDispatchToPropsSketchListRow(dispatch) {
  return bindActionCreators(
    Object.assign({}, CollectionsActions, ProjectActions, IdeActions),
    dispatch
  );
}

const CollectionItemRow = connect(
  null,
  mapDispatchToPropsSketchListRow
)(CollectionItemRowBase);

class Collection extends React.Component {
  constructor(props) {
    super(props);
    this.props.getCollections(this.props.username);
    this.props.resetSorting();
    this._renderFieldHeader = this._renderFieldHeader.bind(this);
  }

  getTitle() {
    if (this.hasCollection()) {
      return `${this.props.t('Common.SiteName')} | ${this.getCollectionName()}`;
    }
    if (this.props.username === this.props.user.username) {
      return this.props.t('Collection.Title');
    }
    return this.props.t('Collection.AnothersTitle', {
      anotheruser: this.props.username
    });
  }

  getUsername() {
    return this.props.username !== undefined
      ? this.props.username
      : this.props.user.username;
  }

  getCollectionName() {
    return this.props.collection.name;
  }

  isOwner() {
    let isOwner = false;

    if (
      this.props.user != null &&
      this.props.user.username &&
      this.props.collection?.owner?.username === this.props.user.username
    ) {
      isOwner = true;
    }

    return isOwner;
  }

  hasCollection() {
    return !!this.props.collection;
  }

  hasCollectionItems() {
    return this.hasCollection() && this.props.collection.items.length > 0;
  }

  _renderLoader() {
    if (this.props.loading && !this.hasCollection()) return <Loader />;
    return null;
  }

  _renderEmptyTable() {
    if (this.hasCollection() && !this.hasCollectionItems()) {
      return (
        <p className="collection-empty-message">
          {this.props.t('Collection.NoSketches')}
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
        buttonLabel = this.props.t('Collection.ButtonLabelAscendingARIA', {
          displayName
        });
      } else {
        buttonLabel = this.props.t('Collection.ButtonLabelDescendingARIA', {
          displayName
        });
      }
    } else if (direction === SortingActions.DIRECTION.ASC) {
      buttonLabel = this.props.t('Collection.ButtonLabelDescendingARIA', {
        displayName
      });
    } else {
      buttonLabel = this.props.t('Collection.ButtonLabelAscendingARIA', {
        displayName
      });
    }
    return buttonLabel;
  };

  _renderFieldHeader(fieldName, displayName) {
    const { field, direction } = this.props.sorting;
    const headerClass = classNames({
      arrowDown: true,
      'sketches-table__header--selected': field === fieldName
    });
    const buttonLabel = this._getButtonLabel(fieldName, displayName);
    return (
      <th scope="col">
        <button
          className="sketch-list__sort-button"
          onClick={() => this.props.toggleDirectionForField(fieldName)}
          aria-label={buttonLabel}
        >
          <span className={headerClass}>{displayName}</span>
          {field === fieldName &&
            direction === SortingActions.DIRECTION.ASC && (
              <ArrowUpIcon
                role="img"
                aria-label={this.props.t('Collection.DirectionAscendingARIA')}
                focusable="false"
              />
            )}
          {field === fieldName &&
            direction === SortingActions.DIRECTION.DESC && (
              <ArrowDownIcon
                role="img"
                aria-label={this.props.t('Collection.DirectionDescendingARIA')}
                focusable="false"
              />
            )}
        </button>
      </th>
    );
  }

  render() {
    const isOwner = this.isOwner();

    return (
      <main
        className="collection-container"
        data-has-items={this.hasCollectionItems() ? 'true' : 'false'}
      >
        <article className="collection">
          <Helmet>
            <title>{this.getTitle()}</title>
          </Helmet>
          {this._renderLoader()}
          <CollectionMetadata collectionId={this.props.collectionId} />
          <article className="collection-content">
            <div className="collection-table-wrapper">
              {this._renderEmptyTable()}
              {this.hasCollectionItems() && (
                <table
                  className="sketches-table"
                  summary={this.props.t('Collection.TableSummary')}
                >
                  <thead>
                    <tr>
                      {this._renderFieldHeader(
                        'name',
                        this.props.t('Collection.HeaderName')
                      )}
                      {this._renderFieldHeader(
                        'createdAt',
                        this.props.t('Collection.HeaderCreatedAt')
                      )}
                      {this._renderFieldHeader(
                        'user',
                        this.props.t('Collection.HeaderUser')
                      )}
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.props.collection.items.map((item) => (
                      <CollectionItemRow
                        key={item.id}
                        item={item}
                        user={this.props.user}
                        username={this.getUsername()}
                        collection={this.props.collection}
                        isOwner={isOwner}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </article>
        </article>
      </main>
    );
  }
}

Collection.propTypes = {
  collectionId: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  getCollections: PropTypes.func.isRequired,
  collection: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    slug: PropTypes.string,
    description: PropTypes.string,
    owner: PropTypes.shape({
      username: PropTypes.string
    }).isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({}))
  }),
  username: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  toggleDirectionForField: PropTypes.func.isRequired,
  resetSorting: PropTypes.func.isRequired,
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired,
  t: PropTypes.func.isRequired
};

Collection.defaultProps = {
  username: undefined,
  collection: null
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
    Object.assign(
      {},
      CollectionsActions,
      ProjectsActions,
      ToastActions,
      SortingActions
    ),
    dispatch
  );
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(Collection)
);
