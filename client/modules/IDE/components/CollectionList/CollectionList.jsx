import PropTypes from 'prop-types';
import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { find } from 'lodash';
import * as ProjectActions from '../../actions/project';
import * as ProjectsActions from '../../actions/projects';
import * as CollectionsActions from '../../actions/collections';
import * as ToastActions from '../../actions/toast';
import * as SortingActions from '../../actions/sorting';
import getSortedCollections from '../../selectors/collections';
import Loader from '../../../App/components/loader';
import Overlay from '../../../App/components/Overlay';
import AddToCollectionSketchList from '../AddToCollectionSketchList';
import { SketchSearchbar } from '../Searchbar';

import CollectionListRow from './CollectionListRow';

import ArrowUpIcon from '../../../../images/sort-arrow-up.svg';
import ArrowDownIcon from '../../../../images/sort-arrow-down.svg';

const CollectionList = ({
  user,
  projectId,
  getCollections,
  getProject,
  collections,
  username: propsUsername,
  loading,
  toggleDirectionForField,
  resetSorting,
  sorting,
  project,
  mobile
}) => {
  const { t } = useTranslation();
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [
    addingSketchesToCollectionId,
    setAddingSketchesToCollectionId
  ] = useState(null);

  useEffect(() => {
    if (projectId) {
      getProject(projectId);
    }
    getCollections(propsUsername || user.username);
    resetSorting();
  }, []);

  useEffect(() => {
    if (!loading) {
      setHasLoadedData(true);
    }
  }, [loading]);

  const getTitle = useMemo(() => {
    if (propsUsername === user.username) {
      return t('CollectionList.Title');
    }
    return t('CollectionList.AnothersTitle', {
      anotheruser: propsUsername
    });
  }, [propsUsername, user.username, t]);

  const showAddSketches = (collectionId) => {
    setAddingSketchesToCollectionId(collectionId);
  };

  const hideAddSketches = () => {
    setAddingSketchesToCollectionId(null);
  };

  const hasCollections = () =>
    (!loading || hasLoadedData) && collections.length > 0;

  const renderLoader = () => {
    if (loading && !hasLoadedData) return <Loader />;
    return null;
  };

  const renderEmptyTable = () => {
    if (!loading && collections.length === 0) {
      return (
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
    } else if (direction === SortingActions.DIRECTION.ASC) {
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
          onClick={() => toggleDirectionForField(fieldName)}
          aria-label={buttonLabel}
        >
          <span className={headerClass}>{displayName}</span>
          {field === fieldName &&
            direction === SortingActions.DIRECTION.ASC && (
              <ArrowUpIcon
                role="img"
                aria-label={t('CollectionList.DirectionAscendingARIA')}
                focusable="false"
              />
            )}
          {field === fieldName &&
            direction === SortingActions.DIRECTION.DESC && (
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
        <title>{getTitle}</title>
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
                  context: mobile ? 'mobile' : ''
                })
              )}
              {renderFieldHeader(
                'updatedAt',
                t('CollectionList.HeaderUpdatedAt', {
                  context: mobile ? 'mobile' : ''
                })
              )}
              {renderFieldHeader(
                'numItems',
                t('CollectionList.HeaderNumItems', {
                  context: mobile ? 'mobile' : ''
                })
              )}
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <CollectionListRow
                mobile={mobile}
                key={collection.id}
                collection={collection}
                user={user}
                username={propsUsername || user.username}
                project={project}
                onAddSketches={() => showAddSketches(collection.id)}
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
            collection={find(collections, { id: addingSketchesToCollectionId })}
          />
        </Overlay>
      )}
    </article>
  );
};

CollectionList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  projectId: PropTypes.string,
  getCollections: PropTypes.func.isRequired,
  getProject: PropTypes.func.isRequired,
  collections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired
    })
  ).isRequired,
  username: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  toggleDirectionForField: PropTypes.func.isRequired,
  resetSorting: PropTypes.func.isRequired,
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    owner: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  mobile: PropTypes.bool
};

CollectionList.defaultProps = {
  projectId: undefined,
  project: {
    id: undefined,
    owner: undefined
  },
  username: undefined,
  mobile: false
};

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
    collections: getSortedCollections(state),
    sorting: state.sorting,
    loading: state.loading,
    project: state.project,
    projectId: ownProps && ownProps.params ? ownProps.params.project_id : null
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign(
      {},
      CollectionsActions,
      ProjectsActions,
      ProjectActions,
      ToastActions,
      SortingActions
    ),
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionList);
