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

// const trashCan = require('../../../images/trash-can.svg');
const arrowUp = require('../../../images/sort-arrow-up.svg');
const arrowDown = require('../../../images/sort-arrow-down.svg');
const downFilledTriangle = require('../../../images/down-filled-triangle.svg');
const btnUpTriangleDivot = require('../../../images/btn-up-triangle-divot.svg');

class SketchList extends React.Component {
  constructor(props) {
    super(props);
    this.props.getProjects(this.props.username);
    this.props.resetSorting();
    this._renderFieldHeader = this._renderFieldHeader.bind(this);
    this.state = {
      actionDialogueDisplayed: new Array(this.props.sketches.length).fill(false),
      renameBoxDisplayed: new Array(this.props.sketches.length).fill(false),
      renameBoxContent: this.props.sketches.map(({ name }) => name)
    };

    this.closeAllDropdowns = this.closeAllDropdowns.bind(this);
    this.closeAllRenameBoxes = this.closeAllRenameBoxes.bind(this);
    this.restoreRenameBoxContent = this.restoreRenameBoxContent.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      renameBoxContent: props.sketches.map(({ name }) => name)
    });
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

  closeAllDropdowns() {
    this.setState({
      actionDialogueDisplayed: new Array(this.props.sketches.length).fill(false)
    });
  }

  closeAllRenameBoxes() {
    this.setState({
      renameBoxDisplayed: new Array(this.props.sketches.length).fill(false)
    });
  }

  restoreRenameBoxContent() {
    this.setState({
      renameBoxContent: this.props.sketches.map(({ name }) => name)
    });
  }

  render() {
    const username = this.props.username !== undefined ? this.props.username : this.props.user.username;
    return (
      <div
        className="sketches-table-container"
        role="presentation"
        onClick={() => {
          this.closeAllDropdowns();
          this.closeAllRenameBoxes();
        }}
      >
        <Helmet>
          <title>{this.getSketchesTitle()}</title>
        </Helmet>
        {this._renderLoader()}
        {this._renderEmptyTable()}
        {this.hasSketches() &&
          <table className="sketches-table" summary="table containing all saved projects">
            <thead>
              <tr>
                {this._renderFieldHeader('name', 'Sketch')}
                {this._renderFieldHeader('createdAt', 'Date Created')}
                {this._renderFieldHeader('updatedAt', 'Date Updated')}
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {this.props.sketches.map((sketch, i) =>
                // eslint-disable-next-line
                <tr 
                  className="sketches-table__row"
                  key={sketch.id}
                  onClick={() => {
                    if (this.state.actionDialogueDisplayed.some(el => el)) {
                      this.closeAllDropdowns();
                      return;
                    }
                    if (this.state.renameBoxDisplayed.some(el => el)) {
                      this.closeAllRenameBoxes();
                      return;
                    }
                    browserHistory.push(`/${username}/sketches/${sketch.id}`);
                  }}
                >
                  <th scope="row">
                    <Link to={`/${username}/sketches/${sketch.id}`}>
                      {this.state.renameBoxDisplayed[i] ? '' : sketch.name}
                    </Link>
                    {this.state.renameBoxDisplayed[i]
                      &&
                      <input
                        value={this.state.renameBoxContent[i]}
                        onChange={(e) => {
                          const renameBoxContent = [...this.state.renameBoxContent];
                          renameBoxContent[i] = e.target.value;
                          this.setState({
                            renameBoxContent
                          });
                        }}
                        onKeyUp={(e) => {
                          // Enter pressed
                          if (e.key === 'Enter') {
                            this.props.changeProjectName(sketch.id, this.state.renameBoxContent[i]);
                            this.restoreRenameBoxContent();
                            this.closeAllRenameBoxes();
                          }
                        }}
                        onBlur={this.restoreRenameBoxContent}
                        onClick={e => e.stopPropagation()}
                        autoFocus //eslint-disable-line
                      />
                    }
                  </th>
                  <td>{format(new Date(sketch.createdAt), 'MMM D, YYYY h:mm A')}</td>
                  <td>{format(new Date(sketch.updatedAt), 'MMM D, YYYY h:mm A')}</td>
                  <td className="sketch-list__dropdown-column">
                    <button
                      className="sketch-list__dropdown-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        this.closeAllRenameBoxes();
                        this.setState(() => {
                          const actionDialogueDisplayed = new Array(this.props.sketches.length).fill(false);
                          actionDialogueDisplayed[i] = true;
                          return {
                            actionDialogueDisplayed,
                          };
                        });
                      }}
                    >
                      <InlineSVG src={downFilledTriangle} alt="Menu" />
                    </button>
                    {this.state.actionDialogueDisplayed[i] &&
                      <ul
                        className="sketch-list__action-dialogue"
                        role="presentation"
                        onClick={e => e.stopPropagation()}
                      >
                        <li>
                          <button
                            className="sketch-list__action-option"
                            onClick={() => {
                              this.closeAllRenameBoxes();
                              this.closeAllDropdowns();
                              const renameBoxDisplayed = new Array(this.props.sketches.length).fill(false);
                              renameBoxDisplayed[i] = true;
                              this.setState({
                                renameBoxDisplayed
                              });
                            }}
                          >
                              Rename
                          </button>
                        </li>
                        <li>
                          <button
                            className="sketch-list__action-option"
                            onClick={() => {
                              this.props.exportProjectAsZip(sketch.id);
                            }}
                          >
                              Download
                          </button>
                        </li>
                        {this.props.user.authenticated &&
                        <li>
                          <button
                            className="sketch-list__action-option"
                            onClick={() => {
                              this.closeAllDropdowns();
                              this.props.cloneProject(sketch.id);
                            }}
                          >
                              Duplicate
                          </button>
                        </li> }
                        <li>
                          <button
                            className="sketch-list__action-option"
                            onClick={() => {
                              this.closeAllDropdowns();
                              this.props.showShareModal(sketch.id, sketch.name);
                            }}
                          >
                              Share
                          </button>
                        </li>
                        <li>
                          <button
                            className="sketch-list__action-option"
                            onClick={(e) => {
                              e.stopPropagation();
                              this.closeAllDropdowns();
                              if (window.confirm(`Are you sure you want to delete "${sketch.name}"?`)) {
                                this.props.deleteProject(sketch.id);
                              }
                            }}
                          >
                              Delete
                          </button>
                        </li>
                      </ul>}
                  </td>
                </tr>)}
            </tbody>
          </table>}
      </div>
    );
  }
}

SketchList.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
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
  showShareModal: PropTypes.func.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    owner: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  cloneProject: PropTypes.func.isRequired,
  exportProjectAsZip: PropTypes.func.isRequired,
  changeProjectName: PropTypes.func.isRequired
};

SketchList.defaultProps = {
  project: {
    id: undefined,
    owner: undefined
  },
  username: undefined
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
  return bindActionCreators(Object.assign({}, SketchActions, ProjectActions, ToastActions, SortingActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SketchList);
