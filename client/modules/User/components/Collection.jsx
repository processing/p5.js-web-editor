import PropTypes from 'prop-types';
import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import {
  getCollections,
  removeFromCollection
} from '../../IDE/actions/collections';
import {
  resetSorting,
  toggleDirectionForField
} from '../../IDE/actions/sorting';
import * as SortingActions from '../../IDE/actions/sorting';
import { getCollection } from '../../IDE/selectors/collections';
import Loader from '../../App/components/loader';
import dates from '../../../utils/formatDate';

import ArrowUpIcon from '../../../images/sort-arrow-up.svg';
import ArrowDownIcon from '../../../images/sort-arrow-down.svg';
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

  const hasCollectionItems = collection?.items.length > 0;
  const hasZeroItems = collection?.items.length === 0;

  const loading = useSelector((state) => state.loading);
  const showLoader = loading && !collection;

  const currentUsername = useSelector((state) => state.user.username);
  const isOwner = username === currentUsername;

  useEffect(() => {
    dispatch(resetSorting());
  }, []);

  useEffect(() => {
    if (!collection) {
      dispatch(getCollections(username));
    }
  }, [username, collection]);

  const title = useMemo(() => {
    if (collection) {
      return `${t('Common.SiteName')} | ${collection.name}`;
    }
    return isOwner
      ? t('Collection.Title')
      : t('Collection.AnothersTitle', { anotheruser: username });
  }, [t, username, collection, isOwner]);

  const { field, direction } = useSelector((state) => state.sorting);

  // TODO: clean this up into a generic table/list/sort component

  const _getButtonLabel = (fieldName, displayName) => {
    let buttonLabel;
    if (field !== fieldName) {
      if (field === 'name') {
        buttonLabel = t('Collection.ButtonLabelAscendingARIA', {
          displayName
        });
      } else {
        buttonLabel = t('Collection.ButtonLabelDescendingARIA', {
          displayName
        });
      }
    } else if (direction === SortingActions.DIRECTION.ASC) {
      buttonLabel = t('Collection.ButtonLabelDescendingARIA', {
        displayName
      });
    } else {
      buttonLabel = t('Collection.ButtonLabelAscendingARIA', {
        displayName
      });
    }
    return buttonLabel;
  };

  const _renderFieldHeader = (fieldName, displayName) => {
    const headerClass = classNames({
      arrowDown: true,
      'sketches-table__header--selected': field === fieldName
    });
    return (
      <th scope="col">
        <button
          className="sketch-list__sort-button"
          onClick={() => dispatch(toggleDirectionForField(fieldName))}
          aria-label={_getButtonLabel(fieldName, displayName)}
        >
          <span className={headerClass}>{displayName}</span>
          {field === fieldName &&
            direction === SortingActions.DIRECTION.ASC && (
              <ArrowUpIcon
                role="img"
                aria-label={t('Collection.DirectionAscendingARIA')}
                focusable="false"
              />
            )}
          {field === fieldName &&
            direction === SortingActions.DIRECTION.DESC && (
              <ArrowDownIcon
                role="img"
                aria-label={t('Collection.DirectionDescendingARIA')}
                focusable="false"
              />
            )}
        </button>
      </th>
    );
  };

  return (
    <main
      className="collection-container"
      data-has-items={hasCollectionItems ? 'true' : 'false'}
    >
      <article className="collection">
        <Helmet>
          <title>{title}</title>
        </Helmet>
        {showLoader && <Loader />}
        {collection && (
          <CollectionMetadata collection={collection} isOwner={isOwner} />
        )}
        <article className="collection-content">
          <div className="collection-table-wrapper">
            {hasZeroItems && (
              <p className="collection-empty-message">
                {t('Collection.NoSketches')}
              </p>
            )}
            {hasCollectionItems && (
              <table
                className="sketches-table"
                summary={t('Collection.TableSummary')}
              >
                <thead>
                  <tr>
                    {_renderFieldHeader('name', t('Collection.HeaderName'))}
                    {_renderFieldHeader(
                      'createdAt',
                      t('Collection.HeaderCreatedAt')
                    )}
                    {_renderFieldHeader('user', t('Collection.HeaderUser'))}
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {collection.items.map((item) => (
                    <CollectionItemRow
                      key={item.id}
                      item={item}
                      collection={collection}
                      isOwner={isOwner}
                    />
                  ))}
                </tbody>
              </table>
            )}
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
