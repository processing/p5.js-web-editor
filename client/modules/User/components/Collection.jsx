import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import * as CollectionsActions from '../../IDE/actions/collections';
import * as SortingActions from '../../IDE/actions/sorting';
import { getCollection } from '../../IDE/selectors/collections';
import Loader from '../../App/components/loader';
import ArrowUpIcon from '../../../images/sort-arrow-up.svg';
import ArrowDownIcon from '../../../images/sort-arrow-down.svg';
import CollectionMetadata from './CollectionMetadata';
import CollectionItemRow from './CollectionItemRow';

const Collection = ({ collectionId, username }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const collection = useSelector((state) => getCollection(state, collectionId));
  const sorting = useSelector((state) => state.sorting);
  const loading = useSelector((state) => state.loading);

  useEffect(() => {
    dispatch(CollectionsActions.getCollections(username));
    dispatch(SortingActions.resetSorting());
  }, [dispatch, username]);

  const isOwner = () =>
    user != null &&
    typeof user.username !== 'undefined' &&
    collection?.owner?.username === user.username;

  const hasCollection = () => !!collection;
  const hasCollectionItems = () =>
    hasCollection() && collection.items.length > 0;

  const getTitle = () => {
    if (hasCollection()) {
      return `${t('Common.SiteName')} | ${collection.name}`;
    }
    if (username === user.username) {
      return t('Collection.Title');
    }
    return t('Collection.AnothersTitle', { anotheruser: username });
  };

  const renderLoader = () => (loading && !hasCollection() ? <Loader /> : null);

  const renderEmptyTable = () => {
    if (hasCollection() && !hasCollectionItems()) {
      return (
        <p className="collection-empty-message">{t('Collection.NoSketches')}</p>
      );
    }
    return null;
  };

  const getButtonLabel = (fieldName, displayName) => {
    const { field, direction } = sorting;
    if (field !== fieldName) {
      return field === 'name'
        ? t('Collection.ButtonLabelAscendingARIA', { displayName })
        : t('Collection.ButtonLabelDescendingARIA', { displayName });
    }
    return direction === SortingActions.DIRECTION.ASC
      ? t('Collection.ButtonLabelDescendingARIA', { displayName })
      : t('Collection.ButtonLabelAscendingARIA', { displayName });
  };

  const renderFieldHeader = (fieldName, displayName) => {
    const { field, direction } = sorting;
    const headerClass = classNames({
      arrowDown: true,
      'sketches-table__header--selected': field === fieldName
    });
    const buttonLabel = getButtonLabel(fieldName, displayName);
    return (
      <th scope="col">
        <button
          className="sketch-list__sort-button"
          onClick={() =>
            dispatch(SortingActions.toggleDirectionForField(fieldName))
          }
          aria-label={buttonLabel}
        >
          <span className={headerClass}>{displayName}</span>
          {field === fieldName &&
            (direction === SortingActions.DIRECTION.ASC ? (
              <ArrowUpIcon
                role="img"
                aria-label={t('Collection.DirectionAscendingARIA')}
              />
            ) : (
              <ArrowDownIcon
                role="img"
                aria-label={t('Collection.DirectionDescendingARIA')}
              />
            ))}
        </button>
      </th>
    );
  };

  return (
    <main
      className="collection-container"
      data-has-items={hasCollectionItems() ? 'true' : 'false'}
    >
      <article className="collection">
        <Helmet>
          <title>{getTitle()}</title>
        </Helmet>
        {renderLoader()}
        <CollectionMetadata collectionId={collectionId} />
        <article className="collection-content">
          <div className="collection-table-wrapper">
            {renderEmptyTable()}
            {hasCollectionItems() && (
              <table
                className="sketches-table"
                summary={t('Collection.TableSummary')}
              >
                <thead>
                  <tr>
                    {renderFieldHeader('name', t('Collection.HeaderName'))}
                    {renderFieldHeader(
                      'createdAt',
                      t('Collection.HeaderCreatedAt')
                    )}
                    {renderFieldHeader('user', t('Collection.HeaderUser'))}
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {collection.items.map((item) => (
                    <CollectionItemRow
                      key={item.id}
                      item={item}
                      user={user}
                      username={username}
                      collection={collection}
                      isOwner={isOwner()}
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
