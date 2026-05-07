import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { addToCollection, removeFromCollection } from '../actions/collections';
import { getCollectionsForCollectionList } from '../actions/collections';
import { Loader } from '../../App/components/Loader';
import getSortedCollections from '../selectors/collections';
import QuickAddList from './QuickAddList';
import { remSize } from '../../../theme';
import Pagination from './Pagination';

export const CollectionAddSketchWrapper = styled.div`
  width: ${remSize(600)};
  max-width: 100%;
  overflow: auto;
`;

export const QuickAddWrapper = styled.div`
  width: ${remSize(600)};
  max-width: 100%;
  padding: ${remSize(24)};
  height: 100%;
`;

const AddToCollectionList = ({ projectId }) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const username = useSelector((state) => state.user.username);

  const collections = useSelector(
    (state) => state.collectionsListCollections.collections
  );

  const paginationMeta = useSelector(
    (state) => state.collectionsListCollections.metadata
  );

  const q = useSelector((state) => state.search.collectionSearchTerm);
  const hasCollections = () => collections?.length > 0;

  const [page, setPage] = useState(1);
  const limit = 10;

  // TODO: improve loading state
  const loading = useSelector((state) => state.loading);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const showLoader = loading && !hasLoadedData;

  useEffect(() => {
    dispatch(
      getCollectionsForCollectionList(username, {
        page,
        limit,
        q
      })
    ).finally(() => setHasLoadedData(true));
  }, [dispatch, username, page, q]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const handleCollectionAdd = (collection) => {
    dispatch(addToCollection(collection.id, projectId));
  };

  const handleCollectionRemove = (collection) => {
    dispatch(removeFromCollection(collection.id, projectId));
  };

  const collectionWithSketchStatus = collections.map((collection) => ({
    ...collection,
    url: `/${collection.owner.username}/collections/${collection.id}`,
    isAdded: collection.items.some((item) => item.projectId === projectId)
  }));

  const getContent = () => {
    if (showLoader) {
      return <Loader />;
    } else if (collections.length === 0) {
      return t('AddToCollectionList.Empty');
    }
    return (
      <>
        <QuickAddList
          items={collectionWithSketchStatus}
          onAdd={handleCollectionAdd}
          onRemove={handleCollectionRemove}
        />
        {hasCollections() && (
          <Pagination
            page={page}
            totalPages={paginationMeta.totalPages}
            onPageChange={setPage}
            limit={limit}
            totalCollections={paginationMeta.totalCollections}
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
          <title>{t('AddToCollectionList.Title')}</title>
        </Helmet>
        {getContent()}
      </QuickAddWrapper>
    </CollectionAddSketchWrapper>
  );
};

AddToCollectionList.propTypes = {
  projectId: PropTypes.string.isRequired
};

export default AddToCollectionList;
