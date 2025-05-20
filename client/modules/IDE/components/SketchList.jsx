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
import getSortedSketches from '../selectors/projects';
import Loader from '../../App/components/loader';
import Overlay from '../../App/components/Overlay';
import AddToCollectionList from './AddToCollectionList';
import SketchListRowBase from './SketchListRowBase';
import ArrowUpIcon from '../../../images/sort-arrow-up.svg';
import ArrowDownIcon from '../../../images/sort-arrow-down.svg';

const SketchList = ({
  user,
  getProjects,
  sketches,
  username,
  loading,
  sorting,
  toggleDirectionForField,
  resetSorting,
  mobile
}) => {
  const [isInitialDataLoad, setIsInitialDataLoad] = useState(true);
  const [sketchToAddToCollection, setSketchToAddToCollection] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    getProjects(username);
    resetSorting();
  }, [getProjects, username, resetSorting]);

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

  return (
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
  mobile: PropTypes.bool
};

SketchList.defaultProps = {
  username: undefined,
  mobile: false
};

function mapStateToProps(state) {
  return {
    user: state.user,
    sketches: getSortedSketches(state),
    sorting: state.sorting,
    loading: state.loading,
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
