import format from 'date-fns/format';
import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';
import InlineSVG from 'react-inlinesvg';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import slugify from 'slugify';
import * as ProjectActions from '../actions/project';
import * as ProjectsActions from '../actions/projects';
import * as ToastActions from '../actions/toast';
import * as SortingActions from '../actions/sorting';
import * as IdeActions from '../actions/ide';
import getSortedSketches from '../selectors/projects';
import Loader from '../../App/components/loader';

const arrowUp = require('../../../images/sort-arrow-up.svg');
const arrowDown = require('../../../images/sort-arrow-down.svg');
const downFilledTriangle = require('../../../images/down-filled-triangle.svg');

class SketchListRowBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      optionsOpen: false,
      renameOpen: false,
      renameValue: props.sketch.name,
      isFocused: false
    };
  }
  onFocusComponent = () => {
    this.setState({ isFocused: true });
  }

  onBlurComponent = () => {
    this.setState({ isFocused: false });
    setTimeout(() => {
      if (!this.state.isFocused) {
        this.closeAll();
      }
    }, 200);
  }

  openOptions = () => {
    this.setState({
      optionsOpen: true
    });
  }

  closeOptions = () => {
    this.setState({
      optionsOpen: false
    });
  }

  toggleOptions = () => {
    if (this.state.optionsOpen) {
      this.closeOptions();
    } else {
      this.openOptions();
    }
  }

  openRename = () => {
    this.setState({
      renameOpen: true
    });
  }

  closeRename = () => {
    this.setState({
      renameOpen: false
    });
  }

  closeAll = () => {
    this.setState({
      renameOpen: false,
      optionsOpen: false
    });
  }

  handleRenameChange = (e) => {
    this.setState({
      renameValue: e.target.value
    });
  }

  handleRenameEnter = (e) => {
    if (e.key === 'Enter') {
      // TODO pass this func
      this.props.changeProjectName(this.props.sketch.id, this.state.renameValue);
      this.closeAll();
    }
  }

  resetSketchName = () => {
    this.setState({
      renameValue: this.props.sketch.name
    });
  }

  handleDropdownOpen = () => {
    this.closeAll();
    this.openOptions();
  }

  handleRenameOpen = () => {
    this.closeAll();
    this.openRename();
  }

  handleSketchDownload = () => {
    this.props.exportProjectAsZip(this.props.sketch.id);
  }

  handleSketchDuplicate = () => {
    this.closeAll();
    this.props.cloneProject(this.props.sketch.id);
  }

  handleSketchShare = () => {
    this.closeAll();
    this.props.showShareModal(this.props.sketch.id, this.props.sketch.name, this.props.username);
  }

  handleSketchDelete = () => {
    this.closeAll();
    if (window.confirm(`Are you sure you want to delete "${this.props.sketch.name}"?`)) {
      this.props.deleteProject(this.props.sketch.id);
    }
  }

  render() {
    const { sketch, username } = this.props;
    const { renameOpen, optionsOpen, renameValue } = this.state;
    const userIsOwner = this.props.user.username === this.props.username;
    let url = `/${username}/sketches/${sketch.id}`;
    if (username === 'p5') {
      url = `/${username}/sketches/${slugify(sketch.name, '_')}`;
    }
    return (
      <tr
        className="sketches-table__row"
        key={sketch.id}
      >
        <th scope="row">
          <Link to={url}>
            {renameOpen ? '' : sketch.name}
          </Link>
          {renameOpen
            &&
            <input
              value={renameValue}
              onChange={this.handleRenameChange}
              onKeyUp={this.handleRenameEnter}
              onBlur={this.resetSketchName}
              onClick={e => e.stopPropagation()}
            />
          }
        </th>
        <td>{format(new Date(sketch.createdAt), 'MMM D, YYYY h:mm A')}</td>
        <td>{format(new Date(sketch.updatedAt), 'MMM D, YYYY h:mm A')}</td>
        <td className="sketch-list__dropdown-column">
          <button
            className="sketch-list__dropdown-button"
            onClick={this.toggleOptions}
            onBlur={this.onBlurComponent}
            onFocus={this.onFocusComponent}
          >
            <InlineSVG src={downFilledTriangle} alt="Menu" />
          </button>
          {optionsOpen &&
            <ul
              className="sketch-list__action-dialogue"
            >
              {userIsOwner &&
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleRenameOpen}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  Rename
                </button>
              </li>}
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleSketchDownload}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  Download
                </button>
              </li>
              {this.props.user.authenticated &&
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleSketchDuplicate}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  Duplicate
                </button>
              </li>}
              { /* <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleSketchShare}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  Share
                </button>
              </li> */ }
              {userIsOwner &&
              <li>
                <button
                  className="sketch-list__action-option"
                  onClick={this.handleSketchDelete}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  Delete
                </button>
              </li>}
            </ul>}
        </td>
      </tr>);
  }
}

SketchListRowBase.propTypes = {
  sketch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  username: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired,
  deleteProject: PropTypes.func.isRequired,
  showShareModal: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  exportProjectAsZip: PropTypes.func.isRequired,
  changeProjectName: PropTypes.func.isRequired
};

function mapDispatchToPropsSketchListRow(dispatch) {
  return bindActionCreators(Object.assign({}, ProjectActions, IdeActions), dispatch);
}

const SketchListRow = connect(null, mapDispatchToPropsSketchListRow)(SketchListRowBase);

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
                {this._renderFieldHeader('name', 'Sketch')}
                {this._renderFieldHeader('createdAt', 'Date Created')}
                {this._renderFieldHeader('updatedAt', 'Date Updated')}
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {this.props.sketches.map(sketch =>
                (<SketchListRow
                  key={sketch.id}
                  sketch={sketch}
                  user={this.props.user}
                  username={username}
                />))}
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
  })
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
  return bindActionCreators(Object.assign({}, ProjectsActions, ToastActions, SortingActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SketchList);
