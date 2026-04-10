import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { addToCollection, removeFromCollection } from '../actions/collections';
import { getProjectsForCollectionList } from '../actions/projects';
import { Loader } from '../../App/components/Loader';
import Pagination from './Pagination';
import QuickAddList from './QuickAddList';
import {
  CollectionAddSketchWrapper,
  QuickAddWrapper
} from './AddToCollectionList';

const AddToCollectionSketchList = ({ collection }) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const username = useSelector((state) => state.user.username);

  const sketches = useSelector(
    (state) => state.collectionsListProjects.projects
  );

  const paginationMeta = useSelector(
    (state) => state.collectionsListProjects.metadata
  );

  const q = useSelector((state) => state.search.sketchSearchTerm);

  const hasSketches = () => sketches?.length > 0;

  const [page, setPage] = useState(1);
  const limit = 10;

  // TODO: improve loading state
  const loading = useSelector((state) => state.loading);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const showLoader = loading && !hasLoadedData;

  useEffect(() => {
    dispatch(
      getProjectsForCollectionList(username, {
        page,
        limit,
        q
      })
    ).finally(() => setHasLoadedData(true));
  }, [dispatch, username, page, q]);

  useEffect(() => {
    setPage(1);
  }, [q]);

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
      (item) =>
        (item.projectId || item.project?.id) === sketch.id && !item.isDeleted
    )
  }));

  const getContent = () => {
    if (showLoader) {
      return <Loader />;
    } else if (sketches.length === 0) {
      // TODO: shouldn't it be NoSketches? -Linda
      return t('AddToCollectionSketchList.NoCollections');
    }
    return (
      <>
        <QuickAddList
          items={sketchesWithAddedStatus}
          onAdd={handleCollectionAdd}
          onRemove={handleCollectionRemove}
        />
        {hasSketches() && (
          <Pagination
            page={page}
            totalPages={paginationMeta.totalPages}
            onPageChange={setPage}
            limit={limit}
            totalSketches={paginationMeta.totalProjects}
            isOverlay
          />
        )}
      </>
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
        projectId: PropTypes.string,
        project: PropTypes.shape({
          id: PropTypes.string
        }),
        isDeleted: PropTypes.bool
      })
    )
  }).isRequired
};

export default AddToCollectionSketchList;
