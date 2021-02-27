import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import find from 'lodash/find';
import { bindActionCreators } from 'redux';
import * as CollectionsActions from '../actions/collections';
import * as ProjectActions from '../actions/project';
import Table from './Table';
import CollectionListRow from './CollectionListRow';
import Overlay from '../../App/components/Overlay';
import AddToCollectionSketchList from './AddToCollectionSketchList';
import SearchBar from './Searchbar/SearchBar';

class CollectionTable extends React.Component {
  constructor(props) {
    super(props);
    if (props.projectId) {
      props.getProject(props.projectId);
    }
    this.props.getCollections(this.props.username);

    this.state = {
      addingSketchesToCollectionId: null
    };
  }

  showAddSketches = (collectionId) => {
    this.setState({
      addingSketchesToCollectionId: collectionId
    });
  };

  hideAddSketches = () => {
    this.setState({
      addingSketchesToCollectionId: null
    });
  };

  render() {
    const CollectionListHeaderRow = [
      { field: 'name', name: 'CollectionList.HeaderName' },
      { field: 'createdAt', name: 'CollectionList.HeaderCreatedAt' },
      { field: 'updatedAt', name: 'CollectionList.HeaderUpdatedAt' },
      { field: 'numItems', name: 'CollectionList.HeaderNumItems' }
    ];
    const { user, username, collections, searchTerm, mobile } = this.props;
    const collectionTableRows = collections.map((collection) => ({
      ...collection,
      row: (
        <CollectionListRow
          mobile={mobile}
          key={collection.id}
          collection={collection}
          user={user}
          username={username}
          project={this.props.project}
          onAddSketches={() => this.showAddSketches(collection.id)}
        />
      )
    }));
    return (
      <div>
        <Table
          key={username}
          username={username}
          headerRow={CollectionListHeaderRow}
          dataRows={collectionTableRows}
          listType="CollectionList"
          searchTerm={searchTerm}
        />
        {this.state.addingSketchesToCollectionId && (
          <Overlay
            title={this.props.t('CollectionList.AddSketch')}
            actions={<SearchBar />}
            closeOverlay={this.hideAddSketches}
            isFixedHeight
          >
            <AddToCollectionSketchList
              username={this.props.username}
              collection={find(this.props.collections, {
                id: this.state.addingSketchesToCollectionId
              })}
            />
          </Overlay>
        )}
      </div>
    );
  }
}

CollectionTable.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    owner: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  projectId: PropTypes.string,
  getProject: PropTypes.func.isRequired,
  getCollections: PropTypes.func.isRequired,
  collections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired
    })
  ).isRequired,
  username: PropTypes.string,
  searchTerm: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  mobile: PropTypes.bool
};

CollectionTable.defaultProps = {
  projectId: undefined,
  project: {
    id: undefined,
    owner: undefined
  },
  username: undefined,
  mobile: false
};

function mapStateToProps(state, ownProps) {
  return {
    collections: state.collections,
    user: state.user,
    project: state.project,
    projectId: ownProps && ownProps.params ? ownProps.params.project_id : null
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign({}, CollectionsActions, ProjectActions),
    dispatch
  );
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(CollectionTable)
);
