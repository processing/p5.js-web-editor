import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Loader } from '../../App/components/Loader';
import {
  addToCollection,
  getCollections,
  removeFromCollection
} from '../actions/collections';
import getSortedCollections from '../selectors/collections';
import QuickAddList from './QuickAddList';
import { remSize } from '../../../theme';
import { Overlay } from '../../App/components/Overlay';
import CollectionCreate from '../../User/components/CollectionCreate';
import { Button } from '../../../common/Button';

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
  const [createCollectionVisible, setCreateCollectionVisible] = useState(false);

  useEffect(() => {
    dispatch(getCollections(username)).then(() => setHasLoadedData(true));
  }, [dispatch, username, createCollectionVisible]);

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
        <Button onClick={() => setCreateCollectionVisible(true)}>
          {t('DashboardView.CreateCollection')}
        </Button>

        {createCollectionVisible && (
          <Overlay
            title={t('DashboardView.CreateCollectionOverlay')}
            closeOverlay={() => setCreateCollectionVisible(false)}
            isCompactHeight
          >
            <CollectionCreate />
          </Overlay>
        )}
        {getContent()}
      </QuickAddWrapper>
    </CollectionAddSketchWrapper>
  );
};

AddToCollectionList.propTypes = {
  projectId: PropTypes.string.isRequired
};

export default AddToCollectionList;
