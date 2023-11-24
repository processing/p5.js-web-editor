import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { useTranslation, withTranslation } from 'react-i18next';

import Button from '../../../common/Button';
import { DropdownArrowIcon } from '../../../common/icons';
import TableBase from '../../../common/Table/TableBase';
import * as ProjectActions from '../../IDE/actions/project';
import * as CollectionsActions from '../../IDE/actions/collections';
import { DIRECTION } from '../../IDE/actions/sorting';
import * as IdeActions from '../../IDE/actions/ide';
import { getCollection } from '../../IDE/selectors/collections';
import Loader from '../../App/components/loader';
import dates from '../../../utils/formatDate';

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
    this.showAddSketches = this.showAddSketches.bind(this);
    this.hideAddSketches = this.hideAddSketches.bind(this);
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

  render() {
    const isOwner = this.isOwner();

    // Need top-level string fields in order to sort.
    const items = this.props.collection?.items?.map((item) => ({
      ...item,
      // 'zz' is a dumb hack to put deleted items last in the sort order
      name: item.isDeleted ? 'zz' : item.project?.name,
      owner: item.isDeleted ? 'zz' : item.project?.user?.username
    }));

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
              <TableBase
                items={items}
                isLoading={this.props.loading && !this.props.collection}
                columns={[
                  {
                    field: 'name',
                    title: this.props.t('Collection.HeaderName'),
                    defaultOrder: DIRECTION.ASC
                  },
                  {
                    field: 'createdAt',
                    title: this.props.t('Collection.HeaderCreatedAt'),
                    defaultOrder: DIRECTION.DESC
                  },
                  {
                    field: 'owner',
                    title: this.props.t('Collection.HeaderUser'),
                    defaultOrder: DIRECTION.ASC
                  }
                ]}
                addDropdownColumn
                initialSort={{
                  field: 'createdAt',
                  direction: DIRECTION.DESC
                }}
                emptyMessage={this.props.t('Collection.NoSketches')}
                caption={this.props.t('Collection.TableSummary')}
                renderRow={(item) => (
                  <CollectionItemRow
                    key={item.id}
                    item={item}
                    user={this.props.user}
                    username={this.getUsername()}
                    collection={this.props.collection}
                    isOwner={isOwner}
                  />
                )}
              />
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
    loading: state.loading
  };
}

export default withTranslation()(
  connect(mapStateToProps, CollectionsActions)(Collection)
);
