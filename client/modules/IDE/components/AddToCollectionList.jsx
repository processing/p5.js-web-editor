import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
// import find from 'lodash/find';
import * as ProjectActions from '../actions/project';
import * as ProjectsActions from '../actions/projects';
import * as CollectionsActions from '../actions/collections';
import * as ToastActions from '../actions/toast';
import getSortedCollections from '../selectors/collections';
import Item from './QuickAddList';
import Table from './Table';

const DIRECTION = {
  ASC: 'ASCENDING',
  DESC: 'DESCENDING'
};

const projectInCollection = (project, collection) =>
  collection.items.find((item) => item.projectId === project.id) != null;

class CollectionList extends React.Component {
  constructor(props) {
    super(props);

    if (props.projectId) {
      props.getProject(props.projectId);
    }

    this.props.getCollections(this.props.username);
  }

  getTitle() {
    if (this.props.username === this.props.user.username) {
      return this.props.t('AddToCollectionList.Title');
    }
    return this.props.t('AddToCollectionList.AnothersTitle', {
      anotheruser: this.props.username
    });
  }

  handleCollectionAdd = (collection) => {
    this.props.addToCollection(collection.id, this.props.project.id);
  };

  handleCollectionRemove = (collection) => {
    this.props.removeFromCollection(collection.id, this.props.project.id);
  };

  render() {
    const { collections, project } = this.props;
    const collectionWithSketchStatus = collections.map((collection) => ({
      ...collection,
      url: `/${collection.owner.username}/collections/${collection.id}`,
      isAdded: projectInCollection(project, collection)
    }));

    let content = null;

    const headerRow = [
      {
        name: '',
        field: '',
        type: 'nonSortable'
      },
      {
        name: this.props.t('CollectionList.HeaderName'),
        field: 'name',
        type: 'string'
      },
      {
        name: '',
        field: '',
        type: 'nonSortable'
      }
    ];

    const sorting = {
      field: 'name',
      type: 'string',
      direction: DIRECTION.DESC
    };

    const extras = {
      emptyTableText: this.props.t('CollectionList.NoCollections'),
      title: this.getTitle(),
      summary: this.props.t('CollectionList.TableSummary'),
      buttonAscAriaLable: 'CollectionList.ButtonLabelAscendingARIA',
      buttonDescAriaLable: 'CollectionList.ButtonLabelDescendingARIA',
      arrowUpIconAriaLable: 'CollectionList.DirectionAscendingARIA',
      arrowDownIconAriaLable: 'CollectionList.DirectionDescendingARIA'
    };

    const handleAction = (collection) => {
      if (collection.isAdded) {
        this.handleCollectionRemove(collection);
      } else {
        this.handleCollectionAdd(collection);
      }
    };

    const dataRows = collectionWithSketchStatus.map((collection) => ({
      ...collection,
      row: (
        <Item
          key={collection.id}
          t={this.props.t}
          {...collection}
          onSelect={(event) => {
            event.stopPropagation();
            event.currentTarget.blur();
            handleAction(collection);
          }}
        />
      )
    }));
    content = (
      <Table
        key={this.props.username}
        username={this.props.username}
        headerRow={headerRow}
        dataRows={dataRows}
        extras={extras}
        sorting={sorting}
      />
    );

    return (
      <div className="collection-add-sketch">
        <div className="quick-add-wrapper">
          <Helmet>
            <title>{this.getTitle()}</title>
          </Helmet>

          {content}
        </div>
      </div>
    );
  }
}

const ProjectShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired
  }).isRequired
});

const ItemsShape = PropTypes.shape({
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  project: ProjectShape
});

CollectionList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  projectId: PropTypes.string.isRequired,
  getCollections: PropTypes.func.isRequired,
  getProject: PropTypes.func.isRequired,
  addToCollection: PropTypes.func.isRequired,
  removeFromCollection: PropTypes.func.isRequired,
  collections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(ItemsShape)
    })
  ).isRequired,
  username: PropTypes.string,
  project: PropTypes.shape({
    id: PropTypes.string,
    owner: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  t: PropTypes.func.isRequired
};

CollectionList.defaultProps = {
  project: {
    id: undefined,
    owner: undefined
  },
  username: undefined
};

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
    collections: getSortedCollections(state),
    project: ownProps.project || state.project,
    projectId: ownProps && ownProps.params ? ownProps.prams.project_id : null
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign(
      {},
      CollectionsActions,
      ProjectsActions,
      ProjectActions,
      ToastActions
    ),
    dispatch
  );
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(CollectionList)
);
