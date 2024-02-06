import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addToCollection, removeFromCollection } from '../actions/collections';
import { getProjects } from '../actions/projects';
import getSortedSketches from '../selectors/projects';
import Loader from '../../App/components/loader';
import QuickAddList from './QuickAddList';
import {
  CollectionAddSketchWrapper,
  QuickAddWrapper
} from './AddToCollectionList';
import { startLoader, stopLoader } from '../reducers/loading';

const AddToCollectionSketchList = ({ collection }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const username = useSelector((state) => state.user.username);
  const sketches = useSelector(getSortedSketches);
  const loading = useSelector((state) => state.loading);

  useEffect(() => {
    dispatch(startLoader());
    dispatch(getProjects(username)).then(() => dispatch(stopLoader()));
  }, [dispatch, username]);

  const handleCollectionAdd = (sketch) => {
    dispatch(addToCollection(collection.id, sketch.id));
  };

  const handleCollectionRemove = (sketch) => {
    dispatch(removeFromCollection(collection.id, sketch.id));
  };

  const sketchesWithAddedStatus = sketches.map((sketch) => ({
    ...sketch,
    url: `/${username}/sketches/${sketch.id}`,
    isAdded: collection.items.some(
      (item) => item.projectId === sketch.id && !item.isDeleted
    )
  }));

  const getContent = () => {
    if (loading) {
      return <Loader />;
    } else if (sketches.length === 0) {
      // TODO: shouldn't it be NoSketches? -Linda
      return t('AddToCollectionSketchList.NoCollections');
    }
    return (
      <QuickAddList
        items={sketchesWithAddedStatus}
        onAdd={handleCollectionAdd}
        onRemove={handleCollectionRemove}
      />
    );
  };

  return (
    <CollectionAddSketchWrapper>
      <QuickAddWrapper>
        <Helmet>
          <title>{t('AddToCollectionSketchList.Title')}</title>
        </Helmet>
        {getContent()}
      </QuickAddWrapper>
    </CollectionAddSketchWrapper>
  );
};

AddToCollectionSketchList.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        projectId: PropTypes.string.isRequired,
        isDeleted: PropTypes.bool
      })
    )
  }).isRequired
};

export default AddToCollectionSketchList;
