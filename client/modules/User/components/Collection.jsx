import PropTypes from 'prop-types';
import React, { useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TableBase from '../../../common/Table/TableBase';
import {
  getCollections,
  removeFromCollection
} from '../../IDE/actions/collections';
import { DIRECTION } from '../../IDE/actions/sorting';
import { getCollection } from '../../IDE/selectors/collections';
import Loader from '../../App/components/loader';
import dates from '../../../utils/formatDate';

import RemoveIcon from '../../../images/close.svg';
import CollectionMetadata from './CollectionMetadata';

const CollectionItemRow = ({ collection, item, isOwner }) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const projectIsDeleted = item.isDeleted;

  const handleSketchRemove = () => {
    const name = projectIsDeleted ? 'deleted sketch' : item.project.name;

    if (
      window.confirm(
        t('Collection.DeleteFromCollection', { name_sketch: name })
      )
    ) {
      dispatch(removeFromCollection(collection.id, item.projectId));
    }
  };

  const name = projectIsDeleted ? (
    <span>{t('Collection.SketchDeleted')}</span>
  ) : (
    <Link to={`/${item.project.user.username}/sketches/${item.projectId}`}>
      {item.project.name}
    </Link>
  );

  const sketchOwnerUsername = projectIsDeleted
    ? null
    : item.project.user.username;

  return (
    <tr
      className={`sketches-table__row ${projectIsDeleted ? 'is-deleted' : ''}`}
    >
      <th scope="row">{name}</th>
      <td>{dates.format(item.createdAt)}</td>
      <td>{sketchOwnerUsername}</td>
      <td className="collection-row__action-column ">
        {isOwner && (
          <button
            className="collection-row__remove-button"
            onClick={handleSketchRemove}
            aria-label={t('Collection.SketchRemoveARIA')}
          >
            <RemoveIcon focusable="false" aria-hidden="true" />
          </button>
        )}
      </td>
    </tr>
  );
};

CollectionItemRow.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  item: PropTypes.shape({
    createdAt: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    isDeleted: PropTypes.bool.isRequired,
    project: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      user: PropTypes.shape({
        username: PropTypes.string.isRequired
      })
    }).isRequired
  }).isRequired,
  isOwner: PropTypes.bool.isRequired
};

const Collection = ({ username, collectionId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const collection = useSelector((state) => getCollection(state, collectionId));

  const loading = useSelector((state) => state.loading);
  const showLoader = loading && !collection;

  const currentUsername = useSelector((state) => state.user.username);
  const isOwner = username === currentUsername;

  useEffect(() => {
    if (!collection) {
      dispatch(getCollections(username));
    }
  }, [username, collection]);

  // Need top-level string fields in order to sort.
  const items = useMemo(
    () =>
      collection?.items?.map((item) => ({
        ...item,
        // 'zz' is a dumb hack to put deleted items last in the sort order
        name: item.isDeleted ? 'zz' : item.project?.name,
        owner: item.isDeleted ? 'zz' : item.project?.user?.username
      })),
    [collection]
  );

  return (
    <main
      className="collection-container"
      data-has-items={collection?.items?.length > 0 ? 'true' : 'false'}
    >
      <article className="collection">
        <Helmet>
          <title>
            {isOwner
              ? t('Collection.Title')
              : t('Collection.AnothersTitle', {
                  anotheruser: username
                })}
          </title>
        </Helmet>
        {showLoader && <Loader />}
        {collection && (
          <CollectionMetadata collection={collection} isOwner={isOwner} />
        )}
        <article className="collection-content">
          <div className="collection-table-wrapper">
            <TableBase
              items={items}
              isLoading={showLoader}
              columns={[
                {
                  field: 'name',
                  title: t('Collection.HeaderName'),
                  defaultOrder: DIRECTION.ASC
                },
                {
                  field: 'createdAt',
                  title: t('Collection.HeaderCreatedAt'),
                  defaultOrder: DIRECTION.DESC
                },
                {
                  field: 'owner',
                  title: t('Collection.HeaderUser'),
                  defaultOrder: DIRECTION.ASC
                }
              ]}
              addDropdownColumn
              initialSort={{
                field: 'createdAt',
                direction: DIRECTION.DESC
              }}
              emptyMessage={t('Collection.NoSketches')}
              caption={t('Collection.TableSummary')}
              renderRow={(item) => (
                <CollectionItemRow
                  key={item.id}
                  item={item}
                  collection={collection}
                  isOwner={isOwner}
                />
              )}
            />
          </div>
        </article>
      </article>
    </main>
  );
};

Collection.propTypes = {
  collectionId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired
};

export default Collection;
