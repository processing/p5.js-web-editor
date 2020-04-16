import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';
import * as IDEActions from '../actions/ide';
import * as FileActions from '../actions/files';
import downArrowUrl from '../../../images/down-filled-triangle.svg';
import folderRightUrl from '../../../images/triangle-arrow-right.svg';
import folderDownUrl from '../../../images/triangle-arrow-down.svg';
import fileUrl from '../../../images/file.svg';

export class FileNode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOptionsOpen: false,
      isEditingName: false,
      isFocused: false,
      isDeleting: false,
      updatedName: this.props.name
    };
  }

  onFocusComponent = () => {
    this.setState({ isFocused: true });
  }

  onBlurComponent = () => {
    this.setState({ isFocused: false });
    setTimeout(() => {
      if (!this.state.isFocused) {
        this.hideFileOptions();
      }
    }, 200);
  }


  setUpdatedName = (updatedName) => {
    this.setState({ updatedName });
  }

  saveUpdatedFileName = () => {
    const { updatedName } = this.state;
    const { name, updateFileName, id } = this.props;

    if (updatedName !== name) {
      updateFileName(id, updatedName);
    }
  }

  handleFileClick = (event) => {
    event.stopPropagation();
    const { isDeleting } = this.state;
    const { id, setSelectedFile, name } = this.props;
    if (name !== 'root' && !isDeleting) {
      setSelectedFile(id);
    }
  }

  handleFileNameChange = (event) => {
    const newName = event.target.value;
    this.setUpdatedName(newName);
  }

  handleFileNameBlur = () => {
    this.validateFileName();
    this.hideEditFileName();
  }

  handleClickRename = () => {
    this.setUpdatedName(this.props.name);
    this.showEditFileName();
    setTimeout(() => this.fileNameInput.focus(), 0);
    setTimeout(() => this.hideFileOptions(), 0);
  }

  handleClickAddFile = () => {
    this.props.newFile(this.props.id);
    setTimeout(() => this.hideFileOptions(), 0);
  }

  handleClickAddFolder = () => {
    this.props.newFolder(this.props.id);
    setTimeout(() => this.hideFileOptions(), 0);
  }

  handleClickUploadFile = () => {
    this.props.openUploadFileModal(this.props.id);
    setTimeout(this.hideFileOptions, 0);
  }

  handleClickDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${this.props.name}?`)) {
      this.setState({ isDeleting: true });
      this.props.resetSelectedFile(this.props.id);
      setTimeout(() => this.props.deleteFile(this.props.id, this.props.parentId), 100);
    }
  }

  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.hideEditFileName();
    }
  }

  validateFileName = () => {
    const currentName = this.props.name;
    const { updatedName } = this.state;
    const oldFileExtension = currentName.match(/\.[0-9a-z]+$/i);
    const newFileExtension = updatedName.match(/\.[0-9a-z]+$/i);
    const hasPeriod = updatedName.match(/\.+/);
    const hasNoExtension = oldFileExtension && !newFileExtension;
    const hasExtensionIfFolder = this.props.fileType === 'folder' && hasPeriod;
    const notSameExtension = oldFileExtension && newFileExtension
      && oldFileExtension[0].toLowerCase() !== newFileExtension[0].toLowerCase();
    const hasEmptyFilename = updatedName.trim() === '';
    const hasOnlyExtension = newFileExtension && updatedName.trim() === newFileExtension[0];
    if (hasEmptyFilename || hasNoExtension || notSameExtension || hasOnlyExtension || hasExtensionIfFolder) {
      this.setUpdatedName(currentName);
    } else {
      this.saveUpdatedFileName();
    }
  }

  toggleFileOptions = (event) => {
    event.preventDefault();
    if (!this.props.canEdit) {
      return;
    }
    if (this.state.isOptionsOpen) {
      this.setState({ isOptionsOpen: false });
    } else {
      this[`fileOptions-${this.props.id}`].focus();
      this.setState({ isOptionsOpen: true });
    }
  }

  hideFileOptions = () => {
    this.setState({ isOptionsOpen: false });
  }

  showEditFileName = () => {
    this.setState({ isEditingName: true });
  }

  hideEditFileName = () => {
    this.setState({ isEditingName: false });
  }

  showFolderChildren = () => {
    this.props.showFolderChildren(this.props.id);
  }

  hideFolderChildren = () => {
    this.props.hideFolderChildren(this.props.id);
  }

  renderChild = childId => (
    <li key={childId}>
      <ConnectedFileNode id={childId} parentId={this.props.id} canEdit={this.props.canEdit} />
    </li>
  )

  render() {
    const itemClass = classNames({
      'sidebar__root-item': this.props.name === 'root',
      'sidebar__file-item': this.props.name !== 'root',
      'sidebar__file-item--selected': this.props.isSelectedFile,
      'sidebar__file-item--open': this.state.isOptionsOpen,
      'sidebar__file-item--editing': this.state.isEditingName,
      'sidebar__file-item--closed': this.props.isFolderClosed
    });

    const isFile = this.props.fileType === 'file';
    const isFolder = this.props.fileType === 'folder';
    const isRoot = this.props.name === 'root';

    return (
      <div className={itemClass}>
        { !isRoot &&
          <div className="file-item__content" onContextMenu={this.toggleFileOptions}>
            <span className="file-item__spacer"></span>
            { isFile &&
              <span className="sidebar__file-item-icon">
                <InlineSVG src={fileUrl} />
              </span>
            }
            { isFolder &&
              <div className="sidebar__file-item--folder">
                <button
                  className="sidebar__file-item-closed"
                  onClick={this.showFolderChildren}
                >
                  <InlineSVG className="folder-right" src={folderRightUrl} />
                </button>
                <button
                  className="sidebar__file-item-open"
                  onClick={this.hideFolderChildren}
                >
                  <InlineSVG className="folder-down" src={folderDownUrl} />
                </button>
              </div>
            }
            <button
              className="sidebar__file-item-name"
              onClick={this.handleFileClick}
            >
              {this.state.updatedName}
            </button>
            <input
              type="text"
              className="sidebar__file-item-input"
              value={this.state.updatedName}
              maxLength="128"
              onChange={this.handleFileNameChange}
              ref={(element) => { this.fileNameInput = element; }}
              onBlur={this.handleFileNameBlur}
              onKeyPress={this.handleKeyPress}
            />
            <button
              className="sidebar__file-item-show-options"
              aria-label="view file options"
              ref={(element) => { this[`fileOptions-${this.props.id}`] = element; }}
              tabIndex="0"
              onClick={this.toggleFileOptions}
              onBlur={this.onBlurComponent}
              onFocus={this.onFocusComponent}
            >
              <InlineSVG src={downArrowUrl} />
            </button>
            <div className="sidebar__file-item-options">
              <ul title="file options">
                { isFolder &&
                  <React.Fragment>
                    <li>
                      <button
                        aria-label="add folder"
                        onClick={this.handleClickAddFolder}
                        onBlur={this.onBlurComponent}
                        onFocus={this.onFocusComponent}
                        className="sidebar__file-item-option"
                      >
                        Create folder
                      </button>
                    </li>
                    <li>
                      <button
                        aria-label="add file"
                        onClick={this.handleClickAddFile}
                        onBlur={this.onBlurComponent}
                        onFocus={this.onFocusComponent}
                        className="sidebar__file-item-option"
                      >
                        Create file
                      </button>
                    </li>
                    { this.props.authenticated &&
                      <li>
                        <button
                          aria-label="upload file"
                          onClick={this.handleClickUploadFile}
                          onBlur={this.onBlurComponent}
                          onFocus={this.onFocusComponent}
                        >
                          Upload file
                        </button>
                      </li>
                    }
                  </React.Fragment>
                }
                <li>
                  <button
                    onClick={this.handleClickRename}
                    onBlur={this.onBlurComponent}
                    onFocus={this.onFocusComponent}
                    className="sidebar__file-item-option"
                  >
                    Rename
                  </button>
                </li>
                <li>
                  <button
                    onClick={this.handleClickDelete}
                    onBlur={this.onBlurComponent}
                    onFocus={this.onFocusComponent}
                    className="sidebar__file-item-option"
                  >
                    Delete
                  </button>
                </li>
              </ul>
            </div>
          </div>
        }
        { this.props.children &&
          <ul className="file-item__children">
            {this.props.children.map(this.renderChild)}
          </ul>
        }
      </div>
    );
  }
}

FileNode.propTypes = {
  id: PropTypes.string.isRequired,
  parentId: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  name: PropTypes.string.isRequired,
  fileType: PropTypes.string.isRequired,
  isSelectedFile: PropTypes.bool,
  isFolderClosed: PropTypes.bool,
  setSelectedFile: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  updateFileName: PropTypes.func.isRequired,
  resetSelectedFile: PropTypes.func.isRequired,
  newFile: PropTypes.func.isRequired,
  newFolder: PropTypes.func.isRequired,
  showFolderChildren: PropTypes.func.isRequired,
  hideFolderChildren: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
  openUploadFileModal: PropTypes.func.isRequired,
  authenticated: PropTypes.bool.isRequired
};

FileNode.defaultProps = {
  parentId: '0',
  isSelectedFile: false,
  isFolderClosed: false,
};

function mapStateToProps(state, ownProps) {
  // this is a hack, state is updated before ownProps
  const fileNode = state.files.find(file => file.id === ownProps.id) || { name: 'test', fileType: 'file' };
  return Object.assign({}, fileNode, { authenticated: state.user.authenticated });
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign(FileActions, IDEActions), dispatch);
}

const ConnectedFileNode = connect(mapStateToProps, mapDispatchToProps)(FileNode);
export default ConnectedFileNode;
