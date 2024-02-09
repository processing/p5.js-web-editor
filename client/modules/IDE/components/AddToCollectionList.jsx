import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import Loader from '../../App/components/loader';
import {
  addToCollection,
  getCollections,
  removeFromCollection
} from '../actions/collections';
import getSortedCollections from '../selectors/collections';
import QuickAddList from './QuickAddList';
import { remSize } from '../../../theme';

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

  const collections = useSelector(getSortedCollections);

  // TODO: improve loading state
  const loading = useSelector((state) => state.loading);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const showLoader = loading && !hasLoadedData;

  useEffect(() => {
    dispatch(getCollections(username)).then(() => setHasLoadedData(true));
  }, [dispatch, username]);

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
      <QuickAddList
        items={collectionWithSketchStatus}
        onAdd={handleCollectionAdd}
        onRemove={handleCollectionRemove}
      />
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
