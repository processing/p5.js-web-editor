import format from 'date-fns/format';
import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import InlineSVG from 'react-inlinesvg';
import { connect } from 'react-redux';
import { browserHistory, Link } from 'react-router';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import * as ProjectActions from '../actions/project';
import * as SketchActions from '../actions/projects';
import * as ToastActions from '../actions/toast';
import * as SortingActions from '../actions/sorting';
import getSortedSketches from '../selectors/projects';
import Loader from '../../App/components/loader';

const trashCan = require('../../../images/trash-can.svg');
const arrowUp = require('../../../images/arrow5_up.svg');
const arrowDown = require('../../../images/arrow5_down.svg');

class SketchList extends React.Component {
  constructor(props) {
    super(props);
    this.props.getProjects(this.props.username);
    this.props.resetSorting();
    this._renderFieldHeader = this._renderFieldHeader.bind(this);
  }

  getSketchesTitle() {
    if (this.props.username === this.props.user.username) {
      return 'p5.js Web Editor | My sketches';
    }
    return `p5.js Web Editor | ${this.props.username}'s sketches`;
  }

  hasSketches() {
    return !this.props.loading && this.props.sketches.length > 0;
  }

  _renderLoader() {
    if (this.props.loading) return <Loader />;
    return null;
  }

  _renderEmptyTable() {
    if (!this.props.loading && this.props.sketches.length === 0) {
      return (<p className="sketches-table__empty">No sketches.</p>);
    }
    return null;
  }

  _renderFieldHeader(fieldName, displayName) {
    const { field, direction } = this.props.sorting;
    const headerClass = classNames({
      'sketches-table__header': true,
      'sketches-table__header--selected': field === fieldName
    });
    return (
      <th scope="col">
        <button className="sketch-list__sort-button" onClick={() => this.props.toggleDirectionForField(fieldName)}>
          <span className={headerClass}>{displayName}</span>
          {field === fieldName && direction === SortingActions.DIRECTION.ASC &&
            <InlineSVG src={arrowUp} />
          }
          {field === fieldName && direction === SortingActions.DIRECTION.DESC &&
            <InlineSVG src={arrowDown} />
          }
        </button>
      </th>
    );
  }

  render() {
    const username = this.props.username !== undefined ? this.props.username : this.props.user.username;
    return (
      <div className="sketches-table-container">
        <Helmet>
          <title>{this.getSketchesTitle()}</title>
        </Helmet>
        {this._renderLoader()}
        {this._renderEmptyTable()}
        {this.hasSketches() &&
          <table className="sketches-table" summary="table containing all saved projects">
            <thead>
              <tr>
                <th className="sketch-list__trash-column" scope="col"></th>
                {this._renderFieldHeader('name', 'Sketch')}
                {this._renderFieldHeader('createdAt', 'Date Created')}
                {this._renderFieldHeader('updatedAt', 'Date Updated')}
              </tr>
            </thead>
            <tbody>
              {this.props.sketches.map(sketch =>
                // eslint-disable-next-line
                <tr 
                  className="sketches-table__row visibility-toggle"
                  key={sketch.id}
                  onClick={() => browserHistory.push(`/${username}/sketches/${sketch.id}`)}
                >
                  <td className="sketch-list__trash-column">
                  {(() => { // eslint-disable-line
                      if (this.props.username === this.props.user.username || this.props.username === undefined) {
                        return (
                          <button
                            className="sketch-list__trash-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete "${sketch.name}"?`)) {
                                this.props.deleteProject(sketch.id);
                              }
                            }}
                          >
                            <InlineSVG src={trashCan} alt="Delete Project" />
                          </button>
                        );
                      }
                    })()}
                  </td>
                  <th scope="row"><Link to={`/${username}/sketches/${sketch.id}`}>{sketch.name}</Link></th>
                  <td>{format(new Date(sketch.createdAt), 'MMM D, YYYY h:mm A')}</td>
                  <td>{format(new Date(sketch.updatedAt), 'MMM D, YYYY h:mm A')}</td>
                </tr>)}
            </tbody>
          </table>}
      </div>
    );
  }
}

SketchList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string
  }).isRequired,
  getProjects: PropTypes.func.isRequired,
  sketches: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  })).isRequired,
  username: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  deleteProject: PropTypes.func.isRequired,
  toggleDirectionForField: PropTypes.func.isRequired,
  resetSorting: PropTypes.func.isRequired,
  sorting: PropTypes.shape({
    field: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired
  }).isRequired,
};

SketchList.defaultProps = {
  username: undefined
};

function mapStateToProps(state) {
  return {
    user: state.user,
    sketches: getSortedSketches(state),
    sorting: state.sorting,
    loading: state.loading
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, SketchActions, ProjectActions, ToastActions, SortingActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SketchList);
