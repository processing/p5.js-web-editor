import React from 'react';
import { useParams } from 'react-router-dom';
import Nav from '../../../components/Nav';
import RootPage from '../../../components/RootPage';
import Collection from '../components/Collection';

const CollectionView = () => {
  const params = useParams();

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

export default CollectionView;
