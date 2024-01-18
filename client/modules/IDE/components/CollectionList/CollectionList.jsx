import find from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Overlay from '../../../App/components/Overlay';
import { getCollections } from '../../actions/collections';
import { DIRECTION } from '../../actions/sorting';
import getFilteredCollections from '../../selectors/collections';
import { selectCurrentUsername } from '../../selectors/users';
import AddToCollectionSketchList from '../AddToCollectionSketchList';
import ConnectedTableBase from '../ConnectedTableBase';
import { SketchSearchbar } from '../Searchbar';

import CollectionListRow from './CollectionListRow';

const CollectionList = ({ username, mobile }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const collections = useSelector(getFilteredCollections);

  // TODO: combine with AddToCollectionList
  const loading = useSelector((state) => state.loading);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const showLoader = loading && !hasLoadedData;

  useEffect(() => {
    dispatch(getCollections(username)).then(() => setHasLoadedData(true));
  }, [dispatch, username]);

  const currentUser = useSelector(selectCurrentUsername);
  const userIsOwner = username === currentUser;

  const [
    addingSketchesToCollectionId,
    setAddingSketchesToCollectionId
  ] = useState(null);

  return (
    <article className="sketches-table-container">
      <Helmet>
        <title>
          {userIsOwner
            ? t('CollectionList.Title')
            : t('CollectionList.AnothersTitle', {
                anotheruser: username
              })}
        </title>
      </Helmet>

      <ConnectedTableBase
        items={collections}
        isLoading={showLoader}
        columns={[
          {
            field: 'name',
            title: t('CollectionList.HeaderName'),
            defaultOrder: DIRECTION.ASC
          },
          {
            field: 'createdAt',
            title: t('CollectionList.HeaderCreatedAt', {
              context: mobile ? 'mobile' : ''
            }),
            defaultOrder: DIRECTION.DESC
          },
          {
            field: 'updatedAt',
            title: t('CollectionList.HeaderUpdatedAt', {
              context: mobile ? 'mobile' : ''
            }),
            defaultOrder: DIRECTION.DESC
          },
          {
            field: 'numItems',
            title: t('CollectionList.HeaderNumItems', {
              context: mobile ? 'mobile' : ''
            }),
            defaultOrder: DIRECTION.DESC
          }
        ]}
        addDropdownColumn
        initialSort={{
          field: 'createdAt',
          direction: DIRECTION.DESC
        }}
        emptyMessage={t('CollectionList.NoCollections')}
        caption={t('CollectionList.TableSummary')}
        renderRow={(collection) => (
          <CollectionListRow
            mobile={mobile}
            key={collection.id}
            collection={collection}
            username={username}
            userIsOwner={userIsOwner}
            onAddSketches={() => setAddingSketchesToCollectionId(collection.id)}
          />
        )}
      />
      {addingSketchesToCollectionId && (
        <Overlay
          title={t('CollectionList.AddSketch')}
          actions={<SketchSearchbar />}
          closeOverlay={() => setAddingSketchesToCollectionId(null)}
          isFixedHeight
        >
          <AddToCollectionSketchList
            username={username}
            collection={find(collections, {
              id: addingSketchesToCollectionId
            })}
          />
        </Overlay>
      )}
    </article>
  );
};

CollectionList.propTypes = {
  username: PropTypes.string.isRequired,
  mobile: PropTypes.bool
};

CollectionList.defaultProps = {
  mobile: false
};

export default CollectionList;
