import React from 'react';
import { useParams } from 'react-router-dom';
import Nav from '../../IDE/components/Header/Nav';
import { RootPage } from '../../../components/RootPage';
import Collection from '../components/Collection';

export const CollectionView = () => {
  // eslint-disable-next-line camelcase
  const params = useParams<{ collection_id: string; username: string }>();

  return (
    <RootPage>
      <Nav layout="dashboard" />
      <Collection
        collectionId={params.collection_id}
        username={params.username}
      />
    </RootPage>
  );
};
