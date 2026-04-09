import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Loader } from '../../App/components/Loader';
import { Button } from '../../../common/Button';
import { generateCollectionName } from '../../../utils/generateRandomName';
import {
  addToCollection,
  createCollectionAndRefresh,
  getCollections,
  removeFromCollection
} from '../actions/collections';
import getSortedCollections from '../selectors/collections';
import QuickAddList from './QuickAddList';
import { remSize, prop } from '../../../theme';

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

const EmptyText = styled.p`
  text-align: center;
  color: ${prop('primaryTextColor')};
  margin-bottom: ${remSize(16)};
`;

const CreateFormWrapper = styled.form`
  display: flex;
  align-items: center;
  gap: ${remSize(8)};
  margin-top: ${remSize(12)};
`;

const CreateInput = styled.input`
  flex: 1;
  padding: ${remSize(8)};
  border: 1px solid ${prop('Button.primary.default.border')};
  border-radius: 2px;
  background-color: ${prop('inputSecondaryBackground')};
  color: ${prop('primaryTextColor')};
  font-size: ${remSize(14)};
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

  const [showCreateForm, setShowCreateForm] = useState(false);
  const generatedName = useMemo(() => generateCollectionName(), []);
  const [newCollectionName, setNewCollectionName] = useState(generatedName);

  useEffect(() => {
    dispatch(getCollections(username)).then(() => setHasLoadedData(true));
  }, [dispatch, username]);

  const handleCollectionAdd = (collection) => {
    dispatch(addToCollection(collection.id, projectId));
  };

  const handleCollectionRemove = (collection) => {
    dispatch(removeFromCollection(collection.id, projectId));
  };

  const handleCreateCollection = (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    dispatch(
      createCollectionAndRefresh({ name: newCollectionName.trim() }, username)
    ).then(() => {
      setShowCreateForm(false);
      setNewCollectionName(generateCollectionName());
    });
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
      return (
        <div>
          <EmptyText>{t('AddToCollectionList.Empty')}</EmptyText>
          {showCreateForm ? (
            <CreateFormWrapper onSubmit={handleCreateCollection}>
              <CreateInput
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder={generatedName}
                aria-label={t('AddToCollectionList.CollectionNameARIA')}
              />
              <Button
                type="submit"
                disabled={!newCollectionName.trim()}
                onClick={handleCreateCollection}
              >
                {t('AddToCollectionList.CreateSubmit')}
              </Button>
            </CreateFormWrapper>
          ) : (
            <Button onClick={() => setShowCreateForm(true)}>
              {t('AddToCollectionList.CreateCollection')}
            </Button>
          )}
        </div>
      );
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
