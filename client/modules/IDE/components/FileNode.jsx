import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';

import * as IDEActions from '../actions/ide';
import * as FileActions from '../actions/files';
import DownArrowIcon from '../../../images/down-filled-triangle.svg';
import FolderRightIcon from '../../../images/triangle-arrow-right.svg';
import FolderDownIcon from '../../../images/triangle-arrow-down.svg';
import FileIcon from '../../../images/file.svg';

function parseFileName(name) {
  const nameArray = name.split('.');
  if (nameArray.length > 1) {
    const extension = `.${nameArray[nameArray.length - 1]}`;
    const baseName = nameArray.slice(0, -1).join('');
    const firstLetter = baseName[0];
    const lastLetter = baseName[baseName.length - 1];
    const middleText = baseName.slice(1, -1);
    return {
      baseName,
      firstLetter,
      lastLetter,
      middleText,
      extension
    };
  }
  const firstLetter = name[0];
  const lastLetter = name[name.length - 1];
  const middleText = name.slice(1, -1);
  return {
    baseName: name,
    firstLetter,
    lastLetter,
    middleText
  };
}

function FileName({ name }) {
  const {
    baseName,
    firstLetter,
    lastLetter,
    middleText,
    extension
  } = parseFileName(name);
  return (
    <span className="sidebar__file-item-name-text">
      <span>{firstLetter}</span>
      {baseName.length > 2 &&
        <span className="sidebar__file-item-name--ellipsis">{middleText}</span>
      }
      {baseName.length > 1 &&
        <span>{lastLetter}</span>
      }
      {extension &&
        <span>{extension}</span>
      }
    </span>
  );
}

FileName.propTypes = {
  name: PropTypes.string.isRequired
};

class FileNode extends React.Component {
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
    const {
      id, setSelectedFile, name, onClickFile
    } = this.props;
    if (name !== 'root' && !isDeleting) {
      setSelectedFile(id);
    }

    // debugger; // eslint-disable-line
    if (onClickFile) { onClickFile(); }
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
    const prompt = this.props.t('Common.DeleteConfirmation', { name: this.props.name });

    if (window.confirm(prompt)) {
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
      <ConnectedFileNode id={childId} parentId={this.props.id} canEdit={this.props.canEdit} onClickFile={this.props.onClickFile} />
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

    const { t } = this.props;

    return (
      <div className={itemClass} >
        { !isRoot &&
          <div className="file-item__content" onContextMenu={this.toggleFileOptions}>
            <span className="file-item__spacer"></span>
            { isFile &&
              <span className="sidebar__file-item-icon">
                <FileIcon focusable="false" aria-hidden="true" />
              </span>
            }
            { isFolder &&
              <div className="sidebar__file-item--folder">
                <button
                  className="sidebar__file-item-closed"
                  onClick={this.showFolderChildren}
                  aria-label={t('FileNode.OpenFolderARIA')}
                >
                  <FolderRightIcon className="folder-right" focusable="false" aria-hidden="true" />
                </button>
                <button
                  className="sidebar__file-item-open"
                  onClick={this.hideFolderChildren}
                  aria-label={t('FileNode.CloseFolderARIA')}
                >
                  <FolderDownIcon className="folder-down" focusable="false" aria-hidden="true" />
                </button>
              </div>
            }
              <button
              aria-label={this.state.updatedName}
              className="sidebar__file-item-name"
              onClick={this.handleFileClick}
              data-testid="file-name"
            >
              <FileName name={this.state.updatedName} />
            </button>
            <input
              data-testid="input"
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
              aria-label={t('FileNode.ToggleFileOptionsARIA')}
              ref={(element) => { this[`fileOptions-${this.props.id}`] = element; }}
              tabIndex="0"
              onClick={this.toggleFileOptions}
              onBlur={this.onBlurComponent}
              onFocus={this.onFocusComponent}
            >
              <DownArrowIcon focusable="false" aria-hidden="true" />
            </button>
            <div className="sidebar__file-item-options">
              <ul title="file options">
                { isFolder &&
                  <React.Fragment>
                    <li>
                      <button
                        aria-label={t('FileNode.AddFolderARIA')}
                        onClick={this.handleClickAddFolder}
                        onBlur={this.onBlurComponent}
                        onFocus={this.onFocusComponent}
                        className="sidebar__file-item-option"
                      >
                        {t('FileNode.AddFolder')}
                      </button>
                    </li>
                    <li>
                      <button
                        aria-label={t('FileNode.AddFileARIA')}
                        onClick={this.handleClickAddFile}
                        onBlur={this.onBlurComponent}
                        onFocus={this.onFocusComponent}
                        className="sidebar__file-item-option"
                      >
                        {t('FileNode.AddFile')}
                      </button>
                    </li>
                    { this.props.authenticated &&
                      <li>
                        <button
                          aria-label={t('FileNode.UploadFileARIA')}
                          onClick={this.handleClickUploadFile}
                          onBlur={this.onBlurComponent}
                          onFocus={this.onFocusComponent}
                        >
                          {t('FileNode.UploadFile')}
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
                    {t('FileNode.Rename')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={this.handleClickDelete}
                    onBlur={this.onBlurComponent}
                    onFocus={this.onFocusComponent}
                    className="sidebar__file-item-option"
                  >
                    {t('FileNode.Delete')}
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
  authenticated: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  onClickFile: PropTypes.func
};

FileNode.defaultProps = {
  onClickFile: null,
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

const TranslatedFileNode = withTranslation()(FileNode);

const ConnectedFileNode = connect(mapStateToProps, mapDispatchToProps)(TranslatedFileNode);

export {
  TranslatedFileNode as FileNode,
  ConnectedFileNode as default
};
