import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as ProjectActions from '../actions/project';
import * as ProjectsActions from '../actions/projects';
import * as CollectionsActions from '../actions/collections';
import * as ToastActions from '../actions/toast';
import * as SortingActions from '../actions/sorting';
import getSortedCollections from '../selectors/collections';
import Loader from '../../App/components/loader';
import QuickAddList from './QuickAddList';

const projectInCollection = (project, collection) =>
  collection.items.find(item => item.project.id === project.id) != null;

class CollectionList extends React.Component {
  constructor(props) {
    super(props);

    if (props.projectId) {
      props.getProject(props.projectId);
    }

    this.props.getCollections(this.props.username);

    this.state = {
      hasLoadedData: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.loading === true && this.props.loading === false) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        hasLoadedData: true,
      });
    }
  }

  getTitle() {
    if (this.props.username === this.props.user.username) {
      return 'p5.js Web Editor | My collections';
    }
    return `p5.js Web Editor | ${this.props.username}'s collections`;
  }

  handleCollectionAdd = (collection) => {
    this.props.addToCollection(collection.id, this.props.project.id);
  }

  handleCollectionRemove = (collection) => {
    this.props.removeFromCollection(collection.id, this.props.project.id);
  }

  render() {
    const { collections, project } = this.props;
    const hasCollections = collections.length > 0;
    const collectionWithSketchStatus = collections.map(collection => ({
      ...collection,
      url: `/${collection.owner.username}/collections/${collection.id}`,
      isAdded: projectInCollection(project, collection),
    }));

    let content = null;

    if (this.props.loading && !this.state.hasLoadedData) {
      content = <Loader />;
    } else if (hasCollections) {
      content = (
        <QuickAddList
          items={collectionWithSketchStatus}
          onAdd={this.handleCollectionAdd}
          onRemove={this.handleCollectionRemove}
        />
      );
    } else {
      content = 'No collections';
    }

    return (
      <div className="quick-add-wrapper">
        <Helmet>
          <title>{this.getTitle()}</title>
        </Helmet>

        {content}
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
  }).isRequired,
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
  collections: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(ItemsShape),
  })).isRequired,
  username: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    owner: PropTypes.shape({
      id: PropTypes.string
    })
  })
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
    sorting: state.sorting,
    loading: state.loading,
    project: ownProps.project || state.project,
    projectId: ownProps && ownProps.params ? ownProps.prams.project_id : null,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign({}, CollectionsActions, ProjectsActions, ProjectActions, ToastActions, SortingActions),
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionList);
