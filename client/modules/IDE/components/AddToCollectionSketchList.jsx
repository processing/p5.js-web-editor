import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import * as ProjectsActions from '../actions/projects';
import * as CollectionsActions from '../actions/collections';
import * as ToastActions from '../actions/toast';
import * as SortingActions from '../actions/sorting';
import getSortedSketches from '../selectors/projects';
import Loader from '../../App/components/loader';
import QuickAddList from './QuickAddList';
import {
  CollectionAddSketchWrapper,
  QuickAddWrapper
} from './AddToCollectionList';

const SketchList = ({
  user,
  getProjects,
  sketches,
  collection,
  username,
  loading,
  addToCollection,
  removeFromCollection,
  sorting,
  t
}) => {
  const [isInitialDataLoad, setIsInitialDataLoad] = useState(true);

  useEffect(() => {
    getProjects(username);
  }, [getProjects, username]);

  useEffect(() => {
    if (sketches && Array.isArray(sketches)) {
      setIsInitialDataLoad(false);
    }
  }, [sketches]);

  console.log(collection);

  const getSketchesTitle = () => {
    if (username === user.username) {
      return t('AddToCollectionSketchList.Title');
    }
    return t('AddToCollectionSketchList.AnothersTitle', {
      anotheruser: username
    });
  };

  const handleCollectionAdd = (sketch) => {
    addToCollection(collection.id, sketch.id);
  };

  const handleCollectionRemove = (sketch) => {
    removeFromCollection(collection.id, sketch.id);
  };

  const inCollection = (sketch) =>
    collection.items.find((item) =>
      item.isDeleted ? false : item.project.id === sketch.id
    ) != null;

  const hasSketches = sketches.length > 0;
  const sketchesWithAddedStatus = sketches.map((sketch) => ({
    ...sketch,
    isAdded: inCollection(sketch),
    url: `/${username}/sketches/${sketch.id}`
  }));

  let content = null;

  if (loading && isInitialDataLoad) {
    content = <Loader />;
  } else if (hasSketches) {
    content = (
      <QuickAddList
        items={sketchesWithAddedStatus}
        onAdd={handleCollectionAdd}
        onRemove={handleCollectionRemove}
      />
    );
  } else {
    content = t('AddToCollectionSketchList.NoCollections');
  }

  return (
    <CollectionAddSketchWrapper>
      <QuickAddWrapper>
        <Helmet>
          <title>{getSketchesTitle()}</title>
        </Helmet>
        {content}
      </QuickAddWrapper>
    </CollectionAddSketchWrapper>
  );
};

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

const mapStateToProps = (state) => ({
  user: state.user,
  sketches: getSortedSketches(state),
  sorting: state.sorting,
  loading: state.loading,
  project: state.project
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    Object.assign(
      {},
      ProjectsActions,
      CollectionsActions,
      ToastActions,
      SortingActions
    ),
    dispatch
  );

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(SketchList)
);
