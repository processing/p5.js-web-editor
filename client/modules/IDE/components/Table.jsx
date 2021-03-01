import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import orderBy from 'lodash/orderBy';
import * as ProjectActions from '../actions/project';
import * as ProjectsActions from '../actions/projects';
import * as CollectionsActions from '../actions/collections';
import * as ToastActions from '../actions/toast';
import * as AssetActions from '../actions/assets';
import Loader from '../../App/components/loader';

import ArrowUpIcon from '../../../images/sort-arrow-up.svg';
import ArrowDownIcon from '../../../images/sort-arrow-down.svg';

const DIRECTION = {
  ASC: 'ASCENDING',
  DESC: 'DESCENDING'
};

class Table extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasLoadedData: false,
      sorting: {
        ...this.props.sorting
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
    const { field, type, direction } = this.state.sorting;
    return this.sortDataRows(
      this.getFilteredDataRows(this.props.dataRows, this.props.searchTerm),
      field,
      type,
      direction
    );
  };

  sortDataRows = (dataRows, field, type, direction) => {
    if (type === 'date') {
      const sortedDataRows = [...dataRows].sort((a, b) => {
        const result =
          direction === DIRECTION.ASC
            ? differenceInMilliseconds(new Date(a[field]), new Date(b[field]))
            : differenceInMilliseconds(new Date(b[field]), new Date(a[field]));
        return result;
      });
      return sortedDataRows;
    }
    return orderBy(
      dataRows,
      `${field}`,
      direction === DIRECTION.ASC ? 'asc' : 'desc'
    );
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
    if (!this.props.loading && this.getSortedDataRows().length === 0) {
      return (
        <p className="sketches-table__empty">
          {this.props.t(this.props.extras.emptyTableText)}
        </p>
      );
    }
    return null;
  }

  _toggleDirectionForField(field, type) {
    if (field && field !== this.state.sorting.field) {
      if (field === 'name') {
        this.setState({
          ...this.state,
          sorting: {
            ...this.state.sorting,
            field,
            type,
            direction: DIRECTION.ASC
          }
        });
      } else {
        this.setState({
          ...this.state,
          sorting: {
            ...this.state.sorting,
            field,
            type,
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
    let buttonLabel;
    if (field !== fieldName) {
      if (field === 'name') {
        buttonLabel = this.props.t(this.props.extras.buttonAscAriaLable, {
          displayName
        });
      } else {
        buttonLabel = this.props.t(this.props.extras.buttonDescAriaLable, {
          displayName
        });
      }
    } else if (direction === DIRECTION.ASC) {
      buttonLabel = this.props.t(this.props.extras.buttonDescAriaLable, {
        displayName
      });
    } else {
      buttonLabel = this.props.t(this.props.extras.buttonAscAriaLable, {
        displayName
      });
    }
    return buttonLabel;
  };

  _renderFieldHeader = (fieldName, displayName, type, index) => {
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
          onClick={() => this._toggleDirectionForField(fieldName, type)}
          aria-label={buttonLabel}
        >
          <span className={headerClass}>{displayName}</span>
          {field === fieldName && direction === DIRECTION.ASC && (
            <ArrowUpIcon
              role="img"
              aria-label={this.props.extras.arrowUpIconAriaLable}
              focusable="false"
            />
          )}
          {field === fieldName && direction === DIRECTION.DESC && (
            <ArrowDownIcon
              role="img"
              aria-label={this.props.extras.arrowDownIconAriaLable}
              focusable="false"
            />
          )}
        </button>
      </th>
    );
  };

  render() {
    return (
      <article className="sketches-table-container">
        <Helmet>
          <title>{this.props.extras.title}</title>
        </Helmet>
        {this._renderLoader()}
        {this._renderEmptyTable()}
        {this.hasDataRows() && (
          <table className="sketches-table" summary={this.props.extras.summary}>
            <thead>
              <tr>
                {this.props.headerRow.map((col, index) =>
                  this._renderFieldHeader(col.field, col.name, col.type, index)
                )}
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {this.getSortedDataRows().map((dataRow) => dataRow.row)}
            </tbody>
          </table>
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
  searchTerm: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    owner: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  extras: PropTypes.shape({
    emptyTableText: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    summary: PropTypes.string,
    buttonAscAriaLable: PropTypes.string,
    buttonDescAriaLable: PropTypes.string,
    arrowUpIconAriaLable: PropTypes.string,
    arrowDownIconAriaLable: PropTypes.string
  }).isRequired,
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired,
  t: PropTypes.func.isRequired
};

Table.defaultProps = {
  project: {
    id: undefined,
    owner: undefined
  },
  searchTerm: ''
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
