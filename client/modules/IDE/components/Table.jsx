import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import orderBy from 'lodash/orderBy';
import find from 'lodash/find';
import * as ProjectActions from '../actions/project';
import * as ProjectsActions from '../actions/projects';
import * as CollectionsActions from '../actions/collections';
import * as ToastActions from '../actions/toast';
import * as AssetActions from '../actions/assets';
import Loader from '../../App/components/loader';
import Overlay from '../../App/components/Overlay';
import AddToCollectionSketchList from './AddToCollectionSketchList';
import AddToCollectionList from './AddToCollectionList';
import { SketchSearchbar } from './Searchbar';

import TableRow from './TableRow';

import ArrowUpIcon from '../../../images/sort-arrow-up.svg';
import ArrowDownIcon from '../../../images/sort-arrow-down.svg';

const DIRECTION = {
  ASC: 'ASCENDING',
  DESC: 'DESCENDING'
};

class Table extends React.Component {
  constructor(props) {
    super(props);

    if (props.projectId) {
      props.getProject(props.projectId);
    }
    if (this.props.listType === 'CollectionList')
      this.props.getCollections(this.props.username);
    if (this.props.listType === 'SketchList')
      this.props.getProjects(this.props.username);
    if (this.props.listType === 'AssetList') this.props.getAssets();

    this.state = {
      hasLoadedData: false,
      addingSketchesToCollectionId: null,
      sorting: {
        field: 'createdAt',
        direction: DIRECTION.DESC
      }
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.loading === true && this.props.loading === false) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        hasLoadedData: true
      });
    }
  }

  getFilteredDataRows = (dataRows, search) => {
    if (search) {
      const searchStrings = dataRows.map((dataRow) => {
        const reducedDataRows = {
          name: dataRow.name
        };
        return {
          ...dataRow,
          searchString: Object.values(reducedDataRows).join(' ').toLowerCase()
        };
      });
      return searchStrings.filter((dataRow) =>
        dataRow.searchString.includes(search.toLowerCase())
      );
    }
    return dataRows;
  };

  getSortedDataRows = () => {
    const { field, direction } = this.state.sorting;
    return this.sortDataRows(
      this.getFilteredDataRows(this.props.dataRows, this.props.searchTerm),
      field,
      direction
    );
  };

  getTitle() {
    if (this.props.listType === 'AssetList')
      return this.props.t('AssetList.Title');
    if (this.props.username === this.props.user.username) {
      return this.props.t(`${this.props.listType}.Title`);
    }
    return this.props.t(`${this.props.listType}.AnothersTitle`, {
      anotheruser: this.props.username
    });
  }

  sortDataRows = (dataRows, field, direction) => {
    if (field === 'name') {
      if (direction === DIRECTION.DESC) {
        return orderBy(dataRows, 'name', 'desc');
      }
      return orderBy(dataRows, 'name', 'asc');
    } else if (field === 'numItems') {
      if (direction === DIRECTION.DESC) {
        return orderBy(dataRows, 'items.length', 'desc');
      }
      return orderBy(dataRows, 'items.length', 'asc');
    } else if (field === 'size') {
      if (direction === DIRECTION.DESC) {
        return orderBy(dataRows, 'size', 'desc');
      }
      return orderBy(dataRows, 'size', 'asc');
    }
    const sortedDataRows = [...dataRows].sort((a, b) => {
      const result =
        direction === DIRECTION.ASC
          ? differenceInMilliseconds(new Date(a[field]), new Date(b[field]))
          : differenceInMilliseconds(new Date(b[field]), new Date(a[field]));
      return result;
    });
    return sortedDataRows;
  };

  showAddSketches = (collectionId) => {
    this.setState({
      addingSketchesToCollectionId: collectionId
    });
  };

  hideAddSketches = () => {
    this.setState({
      addingSketchesToCollectionId: null
    });
  };

  hasDataRows() {
    return (
      (!this.props.loading || this.state.hasLoadedData) &&
      this.getSortedDataRows().length > 0
    );
  }

  _renderLoader() {
    if (this.props.loading && !this.state.hasLoadedData) return <Loader />;
    return null;
  }

  _renderEmptyTable() {
    let text;
    if (this.props.listType === 'CollectionList')
      text = 'CollectionList.NoCollections';
    else if (this.props.listType === 'SketchList')
      text = 'SketchList.NoSketches';
    else if (this.props.listType === 'AssetList')
      text = 'AssetList.NoUploadedAssets';
    if (!this.props.loading && this.getSortedDataRows().length === 0) {
      return <p className="sketches-table__empty">{this.props.t(text)}</p>;
    }
    return null;
  }

  _toggleDirectionForField(field) {
    if (field && field !== this.state.sorting.field) {
      if (field === 'name') {
        this.setState({
          ...this.state,
          sorting: {
            ...this.state.sorting,
            field,
            direction: DIRECTION.ASC
          }
        });
      } else {
        this.setState({
          ...this.state,
          sorting: {
            ...this.state.sorting,
            field,
            direction: DIRECTION.DESC
          }
        });
      }
    } else if (this.state.sorting.direction === DIRECTION.ASC) {
      this.setState({
        ...this.state,
        sorting: {
          ...this.state.sorting,
          direction: DIRECTION.DESC
        }
      });
    } else {
      this.setState({
        ...this.state,
        sorting: {
          ...this.state.sorting,
          direction: DIRECTION.ASC
        }
      });
    }
  }

  _getButtonLabel = (fieldName, displayName) => {
    const { field, direction } = this.state.sorting;
    const list = this.props.listType;
    let buttonLabel;
    if (field !== fieldName) {
      if (field === 'name') {
        buttonLabel = this.props.t(`${list}.ButtonLabelAscendingARIA`, {
          displayName
        });
      } else {
        buttonLabel = this.props.t(`${list}.ButtonLabelDescendingARIA`, {
          displayName
        });
      }
    } else if (direction === DIRECTION.ASC) {
      buttonLabel = this.props.t(`${list}.ButtonLabelDescendingARIA`, {
        displayName
      });
    } else {
      buttonLabel = this.props.t(`${list}.ButtonLabelAscendingARIA`, {
        displayName
      });
    }
    return buttonLabel;
  };

  _renderFieldHeader = (fieldName, displayName, index) => {
    const { field, direction } = this.state.sorting;
    const headerClass = classNames({
      'sketches-table__header': true,
      'sketches-table__header--selected': field === fieldName
    });
    const buttonLabel = this._getButtonLabel(fieldName, displayName);
    return (
      <th scope="col" key={index}>
        <button
          className="sketch-list__sort-button"
          onClick={() => this._toggleDirectionForField(fieldName)}
          aria-label={buttonLabel}
        >
          <span className={headerClass}>{displayName}</span>
          {field === fieldName && direction === DIRECTION.ASC && (
            <ArrowUpIcon
              role="img"
              aria-label={this.props.t(
                `${this.props.listType}.DirectionAscendingARIA`
              )}
              focusable="false"
            />
          )}
          {field === fieldName && direction === DIRECTION.DESC && (
            <ArrowDownIcon
              role="img"
              aria-label={this.props.t(
                `${this.props.listType}.DirectionDescendingARIA`
              )}
              focusable="false"
            />
          )}
        </button>
      </th>
    );
  };

  render() {
    const username =
      this.props.username !== undefined
        ? this.props.username
        : this.props.user.username;
    const { mobile } = this.props;

    return (
      <article className="sketches-table-container">
        <Helmet>
          <title>{this.getTitle()}</title>
        </Helmet>
        {this._renderLoader()}
        {this._renderEmptyTable()}
        {this.hasDataRows() && (
          <table
            className="sketches-table"
            summary={this.props.t(`${this.props.listType}.TableSummary`)}
          >
            <thead>
              <tr>
                {this.props.headerRow.map((col, index) =>
                  this._renderFieldHeader(
                    col.field,
                    this.props.t(col.name),
                    index
                  )
                )}
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {this.getSortedDataRows().map((dataRow) => (
                <TableRow
                  mobile={mobile}
                  key={dataRow.id}
                  dataRow={dataRow}
                  user={this.props.user}
                  username={username}
                  project={this.props.project}
                  onAddSketches={() => this.showAddSketches(dataRow.id)}
                  listType={this.props.listType}
                  onAddToCollection={() => {
                    this.setState({ sketchToAddToCollection: dataRow });
                  }}
                />
              ))}
            </tbody>
          </table>
        )}
        {this.state.addingSketchesToCollectionId && (
          <Overlay
            title={this.props.t('CollectionList.AddSketch')}
            actions={<SketchSearchbar />}
            closeOverlay={this.hideAddSketches}
            isFixedHeight
          >
            <AddToCollectionSketchList
              username={this.props.username}
              collection={find(this.getSortedDataRows(), {
                id: this.state.addingSketchesToCollectionId
              })}
            />
          </Overlay>
        )}
        {this.state.sketchToAddToCollection && (
          <Overlay
            isFixedHeight
            title={this.props.t('SketchList.AddToCollectionOverlayTitle')}
            closeOverlay={() =>
              this.setState({ sketchToAddToCollection: null })
            }
          >
            <AddToCollectionList
              project={this.state.sketchToAddToCollection}
              username={this.props.username}
              user={this.props.user}
            />
          </Overlay>
        )}
      </article>
    );
  }
}

Table.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  projectId: PropTypes.string,
  getCollections: PropTypes.func.isRequired,
  getProjects: PropTypes.func.isRequired,
  getProject: PropTypes.func.isRequired,
  getAssets: PropTypes.func.isRequired,
  dataRows: PropTypes.oneOfType(
    [
      PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          description: PropTypes.string,
          createdAt: PropTypes.string.isRequired,
          updatedAt: PropTypes.string.isRequired
        })
      )
    ],
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        updatedAt: PropTypes.string.isRequired
      })
    )
  ).isRequired,
  headerRow: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  listType: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  username: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    owner: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  t: PropTypes.func.isRequired,
  mobile: PropTypes.bool
};

Table.defaultProps = {
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
      AssetActions
    ),
    dispatch
  );
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(Table)
);
