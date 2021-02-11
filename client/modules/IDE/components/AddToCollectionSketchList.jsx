import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
// import find from 'lodash/find';
import * as ProjectsActions from '../actions/projects';
import * as CollectionsActions from '../actions/collections';
import * as ToastActions from '../actions/toast';
import * as SortingActions from '../actions/sorting';
import getSortedSketches from '../selectors/projects';
import Loader from '../../App/components/loader';
import QuickAddList from './QuickAddList';

class SketchList extends React.Component {
  constructor(props) {
    super(props);
    this.props.getProjects(this.props.username);

    this.state = {
      isInitialDataLoad: true
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.sketches !== nextProps.sketches &&
      Array.isArray(nextProps.sketches)
    ) {
      this.setState({
        isInitialDataLoad: false
      });
    }
  }

  getSketchesTitle() {
    if (this.props.username === this.props.user.username) {
      return this.props.t('AddToCollectionSketchList.Title');
    }
    return this.props.t('AddToCollectionSketchList.AnothersTitle', {
      anotheruser: this.props.username
    });
  }

  handleCollectionAdd = (sketch) => {
    this.props.addToCollection(this.props.collection.id, sketch.id);
  };

  handleCollectionRemove = (sketch) => {
    this.props.removeFromCollection(this.props.collection.id, sketch.id);
  };

  inCollection = (sketch) =>
    this.props.collection.items.find((item) => item.project.id === sketch.id) !=
    null;

  render() {
    const hasSketches = this.props.sketches.length > 0;
    const sketchesWithAddedStatus = this.props.sketches.map((sketch) => ({
      ...sketch,
      isAdded: this.inCollection(sketch),
      url: `/${this.props.username}/sketches/${sketch.id}`
    }));

    let content = null;

    if (this.props.loading && this.state.isInitialDataLoad) {
      content = <Loader />;
    } else if (hasSketches) {
      content = (
        <QuickAddList
          items={sketchesWithAddedStatus}
          onAdd={this.handleCollectionAdd}
          onRemove={this.handleCollectionRemove}
        />
      );
    } else {
      content = this.props.t('AddToCollectionSketchList.NoCollections');
    }

    return (
      <div className="collection-add-sketch">
        <div className="quick-add-wrapper">
          <Helmet>
            <title>{this.getSketchesTitle()}</title>
          </Helmet>
          {content}
        </div>
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
  sketches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired
    })
  ).isRequired,
  collection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        project: PropTypes.shape({
          id: PropTypes.string.isRequired
        })
      })
    )
  }).isRequired,
  username: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired,
  addToCollection: PropTypes.func.isRequired,
  removeFromCollection: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

SketchList.defaultProps = {
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
