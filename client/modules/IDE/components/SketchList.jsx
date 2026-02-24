/* eslint-disable max-len */
import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { bindActionCreators } from 'redux';
import * as ProjectsActions from '../actions/projects';
import * as CollectionsActions from '../actions/collections';
import * as ToastActions from '../actions/toast';
import * as SortingActions from '../actions/sorting';
import { Loader } from '../../App/components/Loader';
import { Overlay } from '../../App/components/Overlay';
import AddToCollectionList from './AddToCollectionList';
import Pagination from './Pagination';
import ArrowUpIcon from '../../../images/sort-arrow-up.svg';
import ArrowDownIcon from '../../../images/sort-arrow-down.svg';
import SketchListRowBase from './SketchListRowBase';

const SketchList = ({
  user,
  getProjects,
  sketches,
  username,
  loading,
  sorting,
  search,
  paginationMeta,
  toggleDirectionForField,
  resetSorting,
  mobile
}) => {
  const [isInitialDataLoad, setIsInitialDataLoad] = useState(true);
  const [page, setPage] = useState(1);
  const limit = mobile ? 7 : 10;
  const [sketchToAddToCollection, setSketchToAddToCollection] = useState(null);
  const { t } = useTranslation();

  const sortField = sorting.field || 'updatedAt';
  const sortDir =
    sorting.direction === SortingActions.DIRECTION.ASC ? 'asc' : 'desc';

  useEffect(() => {
    resetSorting();
  }, [username, resetSorting]);

  useEffect(() => {
    setPage(1);
  }, [username, search, sortField, sortDir]);

  useEffect(() => {
    getProjects(username, {
      page,
      limit,
      sortField,
      sortDir,
      q: search
    });
  }, [getProjects, username, page, limit, sortField, sortDir, search]);

  useEffect(() => {
    if (Array.isArray(sketches)) {
      setIsInitialDataLoad(false);
    }
  }, [sketches]);

  const getSketchesTitle = useMemo(
    () =>
      username === user.username
        ? t('SketchList.Title')
        : t('SketchList.AnothersTitle', { anotheruser: username }),
    [username, user.username, t]
  );

  const handleDeletedProject = useCallback(() => {
    // sketches table refetches projects post-project deletion for server-side pagination
    if (sketches.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      getProjects(username, {
        page,
        limit,
        sortField,
        sortDir,
        q: search
      });
    }
  }, [
    sketches.length,
    page,
    getProjects,
    username,
    limit,
    sortField,
    sortDir,
    search
  ]);

  const isLoading = () => loading && isInitialDataLoad;

  const hasSketches = () => !isLoading() && sketches.length > 0;

  const renderLoader = () => isLoading() && <Loader />;

  const renderEmptyTable = () => {
    if (!isLoading() && sketches.length === 0) {
      return (
        <p className="sketches-table__empty">{t('SketchList.NoSketches')}</p>
      );
    }
    return null;
  };

  const getButtonLabel = useCallback(
    (fieldName, displayName) => {
      const { field, direction } = sorting;
      if (field !== fieldName) {
        return field === 'name'
          ? t('SketchList.ButtonLabelAscendingARIA', { displayName })
          : t('SketchList.ButtonLabelDescendingARIA', { displayName });
      }
      return direction === SortingActions.DIRECTION.ASC
        ? t('SketchList.ButtonLabelDescendingARIA', { displayName })
        : t('SketchList.ButtonLabelAscendingARIA', { displayName });
    },
    [sorting, t]
  );

  const renderFieldHeader = useCallback(
    (fieldName, displayName) => {
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
              (direction === SortingActions.DIRECTION.ASC ? (
                <ArrowUpIcon
                  focusable="false"
                  role="img"
                  aria-label={t('SketchList.DirectionAscendingARIA')}
                />
              ) : (
                <ArrowDownIcon
                  focusable="false"
                  role="img"
                  aria-label={t('SketchList.DirectionDescendingARIA')}
                />
              ))}
          </button>
        </th>
      );
    },
    [sorting, getButtonLabel, toggleDirectionForField, t]
  );

  const userIsOwner = user.username === username;

  return (
    <>
      <article className="sketches-table-container">
        <Helmet>
          <title>{getSketchesTitle}</title>
        </Helmet>
        {renderLoader()}
        {renderEmptyTable()}
        {hasSketches() && (
          <table
            className="sketches-table"
            summary={t('SketchList.TableSummary')}
          >
            <thead>
              <tr>
                {renderFieldHeader('name', t('SketchList.HeaderName'))}
                {renderFieldHeader(
                  'createdAt',
                  t('SketchList.HeaderCreatedAt', {
                    context: mobile ? 'mobile' : ''
                  })
                )}
                {renderFieldHeader(
                  'updatedAt',
                  t('SketchList.HeaderUpdatedAt', {
                    context: mobile ? 'mobile' : ''
                  })
                )}
                {userIsOwner &&
                  renderFieldHeader('visibility', t('Visibility.Label'))}
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {sketches.map((sketch) => (
                <SketchListRowBase
                  mobile={mobile}
                  key={sketch.id}
                  sketch={sketch}
                  user={user}
                  username={username}
                  onAddToCollection={() => setSketchToAddToCollection(sketch)}
                  onDeletedProject={handleDeletedProject}
                  t={t}
                />
              ))}
            </tbody>
          </table>
        )}

        {sketchToAddToCollection && (
          <Overlay
            isFixedHeight
            title={t('SketchList.AddToCollectionOverlayTitle')}
            closeOverlay={() => setSketchToAddToCollection(null)}
          >
            <AddToCollectionList projectId={sketchToAddToCollection.id} />
          </Overlay>
        )}
      </article>
      {hasSketches() && (
        <Pagination
          page={page}
          totalPages={paginationMeta.totalPages}
          onPageChange={setPage}
          limit={limit}
          totalSketches={paginationMeta.totalProjects}
        />
      )}
    </>
  );
};

SketchList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  getProjects: PropTypes.func.isRequired,
  sketches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
      visibility: PropTypes.string
    })
  ).isRequired,
  paginationMeta: PropTypes.shape({
    page: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    totalProjects: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired,
    hasPagination: PropTypes.bool.isRequired
  }).isRequired,
  username: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  toggleDirectionForField: PropTypes.func.isRequired,
  resetSorting: PropTypes.func.isRequired,
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired,
  search: PropTypes.string.isRequired,
  mobile: PropTypes.bool
};

SketchList.defaultProps = {
  username: undefined,
  mobile: false
};

function mapStateToProps(state) {
  return {
    user: state.user,
    sketches: state.sketches.projects ?? [],
    paginationMeta: state.sketches.metadata ?? {
      page: 1,
      totalPages: 1,
      totalProjects: 0,
      limit: 10,
      hasPagination: true
    },
    sorting: state.sorting,
    loading: state.loading,
    search: state.search.sketchSearchTerm,
    project: state.project
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign(
      {},
      ProjectsActions,
      CollectionsActions,
      ToastActions,
      SortingActions
    ),
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(SketchList);
