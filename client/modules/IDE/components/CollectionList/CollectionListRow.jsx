import format from 'date-fns/format';
import PropTypes from 'prop-types';
import React from 'react';
import InlineSVG from 'react-inlinesvg';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import * as ProjectActions from '../../actions/project';
import * as CollectionsActions from '../../actions/collections';
import * as IdeActions from '../../actions/ide';
import * as ToastActions from '../../actions/toast';

const downFilledTriangle = require('../../../../images/down-filled-triangle.svg');

class CollectionListRowBase extends React.Component {
  static projectInCollection(project, collection) {
    console.log('project in collection', project, collection);
    return collection.items.find(item => item.project.id === project.id) != null;
  }

  constructor(props) {
    super(props);
    this.state = {
      optionsOpen: false,
      renameOpen: false,
      renameValue: props.collection.name,
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
      this.props.changeProjectName(this.props.collection.id, this.state.renameValue);
      this.closeAll();
    }
  }

  resetSketchName = () => {
    this.setState({
      renameValue: this.props.collection.name
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
    this.props.exportProjectAsZip(this.props.collection.id);
  }

  handleSketchDuplicate = () => {
    this.closeAll();
    this.props.cloneProject(this.props.collection.id);
  }

  handleSketchShare = () => {
    this.closeAll();
    this.props.showShareModal(this.props.collection.id, this.props.collection.name, this.props.username);
  }

  handleSketchDelete = () => {
    this.closeAll();
    if (window.confirm(`Are you sure you want to delete "${this.props.collection.name}"?`)) {
      this.props.deleteProject(this.props.collection.id);
    }
  }

  handleCollectionAdd = () => {
    this.props.addToCollection(this.props.collection.id, this.props.project.id);
  }

  handleCollectionRemove = () => {
    this.props.removeFromCollection(this.props.collection.id, this.props.project.id);
  }

  renderActions = () => {
    const { optionsOpen } = this.state;
    const userIsOwner = this.props.user.username === this.props.username;

    if (this.props.addMode === true && this.props.project) {
      return CollectionListRowBase.projectInCollection(this.props.project, this.props.collection) ? <button onClick={this.handleCollectionRemove}>Remove</button> : <button onClick={this.handleCollectionAdd}>Add</button>;
    }

    return (
      <React.Fragment>
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
                  onClick={this.handleSketchDelete}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  Delete
                </button>
              </li>}
          </ul>
        }
      </React.Fragment>
    );
  }

  renderCollectionName = () => {
    const { addMode, collection, username } = this.props;
    const { renameOpen, renameValue } = this.state;
  
    if (addMode) {
      return collection.name;
    }

    return (
      <React.Fragment>
        <Link to={{ pathname: `/${username}/collections/${collection.id}`, state: { skipSavingPath: true } }}>
          {renameOpen ? '' : collection.name}
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
      </React.Fragment>
    )
  }

  render() {
    const { collection } = this.props;

    return (
      <tr
        className="sketches-table__row"
        key={collection.id}
      >
        <th scope="row">
          {this.renderCollectionName()}
        </th>
        <td>{format(new Date(collection.createdAt), 'MMM D, YYYY')}</td>
        <td>{format(new Date(collection.updatedAt), 'MMM D, YYYY')}</td>
        <td>{(collection.items || []).length}</td>
        <td className="sketch-list__dropdown-column">
          {this.renderActions()}
        </td>
      </tr>
    );
  }
}

CollectionListRowBase.propTypes = {
  addToCollection: PropTypes.func.isRequired,
  removeFromCollection: PropTypes.func.isRequired,
  collection: PropTypes.shape({
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
  return bindActionCreators(Object.assign({}, CollectionsActions, ProjectActions, IdeActions, ToastActions), dispatch);
}

export default connect(null, mapDispatchToPropsSketchListRow)(CollectionListRowBase);
