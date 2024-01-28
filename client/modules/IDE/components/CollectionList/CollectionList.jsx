/* eslint-disable react/react-in-jsx-scope */
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import { find } from 'lodash';
import Loader from '../../../App/components/loader';
import Overlay from '../../../App/components/Overlay';
import AddToCollectionSketchList from '../AddToCollectionSketchList';
import { SketchSearchbar } from '../Searchbar';
import ArrowUpIcon from '../../../../images/sort-arrow-up.svg';
import ArrowDownIcon from '../../../../images/sort-arrow-down.svg';
import { getProject } from '../../actions/project';
import { getCollections } from '../../actions/collections';
import getSortedCollections from '../../selectors/collections';
import { DIRECTION, toggleDirectionForField } from '../../actions/sorting';
import CollectionListRow from './CollectionListRow';

const CollectionList = (props) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { project_id: projectId } = useParams() || { project_id: null };
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const { user, sorting, loading, collections } = useSelector((state) => ({
    user: state.user,
    sorting: state.sorting,
    loading: state.loading,
    collections: getSortedCollections(state)
  }));

  const [
    addingSketchesToCollectionId,
    setAddingSketchesToCollectionId
  ] = useState(null);

  useEffect(() => {
    if (projectId) {
      dispatch(getProject(props.username));
    }
    dispatch(getCollections(props.username)).then(() => setHasLoadedData(true));
  }, [dispatch, props.username]);

  const getTitle = () => {
    if (props.username === user.username) {
      return t('CollectionList.Title');
    }
    return t('CollectionList.AnothersTitle', { anotheruser: props.username });
  };

  const showAddSketches = (collectionId) => {
    setAddingSketchesToCollectionId(collectionId);
  };

  const hideAddSketches = () => {
    setAddingSketchesToCollectionId(null);
  };

  const hasCollections = () =>
    !loading && hasLoadedData && collections.length > 0;

  const renderLoader = () => (loading && !hasLoadedData ? <Loader /> : null);

  const renderEmptyTable = () => {
    if (!loading && collections.length === 0) {
      return (
        // eslint-disable-next-line react/react-in-jsx-scope
        <p className="sketches-table__empty">
          {t('CollectionList.NoCollections')}
        </p>
      );
    }
    return null;
  };
  const getButtonLabel = (fieldName, displayName) => {
    const { field, direction } = sorting;
    let buttonLabel;
    if (field !== fieldName) {
      buttonLabel =
        field === 'name'
          ? t('CollectionList.ButtonLabelAscendingARIA', { displayName })
          : t('CollectionList.ButtonLabelDescendingARIA', { displayName });
    } else if (direction === DIRECTION.ASC) {
      buttonLabel = t('CollectionList.ButtonLabelDescendingARIA', {
        displayName
      });
    } else {
      buttonLabel = t('CollectionList.ButtonLabelAscendingARIA', {
        displayName
      });
    }
    return buttonLabel;
  };
  const renderFieldHeader = (fieldName, displayName) => {
    const { field, direction } = sorting;
    const headerClass = classNames({
      'sketches-table__header': true,
      'sketches-table__header--selected': field === fieldName
    });
    const buttonLabel = getButtonLabel(fieldName, displayName);
    return (
      <th scope="col">
        <button
          className="sketch-list__sort-button"
          onClick={() => {
            dispatch(toggleDirectionForField(fieldName));
          }}
          aria-label={buttonLabel}
        >
          <span className={headerClass}>{displayName}</span>
          {field === fieldName && direction === DIRECTION.ASC && (
            <ArrowUpIcon
              role="img"
              aria-label={t('CollectionList.DirectionAscendingARIA')}
              focusable="false"
            />
          )}
          {field === fieldName && direction === DIRECTION.DESC && (
            <ArrowDownIcon
              role="img"
              aria-label={t('CollectionList.DirectionDescendingARIA')}
              focusable="false"
            />
          )}
        </button>
      </th>
    );
  };

  return (
    <article className="sketches-table-container">
      <Helmet>
        <title>{getTitle()}</title>
      </Helmet>

      {renderLoader()}
      {renderEmptyTable()}
      {hasCollections() && (
        <table
          className="sketches-table"
          summary={t('CollectionList.TableSummary')}
        >
          <thead>
            <tr>
              {renderFieldHeader('name', t('CollectionList.HeaderName'))}
              {renderFieldHeader(
                'createdAt',
                t('CollectionList.HeaderCreatedAt', {
                  context: props.mobile ? 'mobile' : ''
                })
              )}
              {renderFieldHeader(
                'updatedAt',
                t('CollectionList.HeaderUpdatedAt', {
                  context: props.mobile ? 'mobile' : ''
                })
              )}
              {renderFieldHeader(
                'numItems',
                t('CollectionList.HeaderNumItems', {
                  context: props.mobile ? 'mobile' : ''
                })
              )}
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <CollectionListRow
                mobile={props.mobile}
                collection={collection}
                user={user}
                username={props.username}
                onAddSketches={() => showAddSketches(collection.id)}
                t={t}
              />
            ))}
          </tbody>
        </table>
      )}
      {addingSketchesToCollectionId && (
        <Overlay
          title={t('CollectionList.AddSketch')}
          actions={<SketchSearchbar />}
          closeOverlay={hideAddSketches}
          isFixedHeight
        >
          <AddToCollectionSketchList
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
  mobile: PropTypes.bool.isRequired
};

export default CollectionList;
