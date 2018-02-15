import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';
import * as IDEActions from '../actions/ide';
import * as FileActions from '../actions/files';

const downArrowUrl = require('../../../images/down-arrow.svg');
const folderRightUrl = require('../../../images/triangle-arrow-right.svg');
const folderDownUrl = require('../../../images/triangle-arrow-down.svg');
const fileUrl = require('../../../images/file.svg');

export class FileNode extends React.Component {
  constructor(props) {
    super(props);
    this.renderChild = this.renderChild.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.validateFileName = this.validateFileName.bind(this);
    this.handleFileClick = this.handleFileClick.bind(this);
    this.toggleFileOptions = this.toggleFileOptions.bind(this);
  }

  handleFileClick(e) {
    e.stopPropagation();
    if (this.props.name !== 'root' && !this.isDeleting) {
      this.props.setSelectedFile(this.props.id);
    }
  }

  handleFileNameChange(event) {
    this.props.updateFileName(this.props.id, event.target.value);
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.props.hideEditFileName(this.props.id);
    }
  }

  validateFileName() {
    const oldFileExtension = this.originalFileName.match(/\.[0-9a-z]+$/i);
    const newFileExtension = this.props.name.match(/\.[0-9a-z]+$/i);
    if (oldFileExtension && !newFileExtension) {
      this.props.updateFileName(this.props.id, this.originalFileName);
    }
    if (
      oldFileExtension &&
      newFileExtension &&
      oldFileExtension[0].toLowerCase() !== newFileExtension[0].toLowerCase()
    ) {
      this.props.updateFileName(this.props.id, this.originalFileName);
    }
  }

  toggleFileOptions(e) {
    e.preventDefault();
    if (this.props.isOptionsOpen) {
      this.props.hideFileOptions(this.props.id);
    } else {
      this[`fileOptions-${this.props.id}`].focus();
      this.props.showFileOptions(this.props.id);
    }
  }

  renderChild(childId) {
    return (
      <li key={childId}>
        <ConnectedFileNode id={childId} parentId={this.props.id} />
      </li>
    );
  }

  render() {
    const itemClass = classNames({
      'sidebar__root-item': this.props.name === 'root',
      'sidebar__file-item': this.props.name !== 'root',
      'sidebar__file-item--selected': this.props.isSelectedFile,
      'sidebar__file-item--open': this.props.isOptionsOpen,
      'sidebar__file-item--editing': this.props.isEditingName,
      'sidebar__file-item--closed': this.props.isFolderClosed
    });
    return (
      <div className={itemClass}>
        {(() => { // eslint-disable-line
          if (this.props.name !== 'root') {
            return (
              <div className="file-item__content" onContextMenu={this.toggleFileOptions}>
                <span className="file-item__spacer"></span>
                {(() => { // eslint-disable-line
                  if (this.props.fileType === 'file') {
                    return (
                      <span className="sidebar__file-item-icon">
                        <InlineSVG src={fileUrl} />
                      </span>
                    );
                  }
                  return (
                    <div className="sidebar__file-item--folder">
                      <button
                        className="sidebar__file-item-closed"
                        onClick={() => this.props.showFolderChildren(this.props.id)}
                      >
                        <InlineSVG className="folder-right" src={folderRightUrl} />
                      </button>
                      <button
                        className="sidebar__file-item-open"
                        onClick={() => this.props.hideFolderChildren(this.props.id)}
                      >
                        <InlineSVG className="folder-down" src={folderDownUrl} />
                      </button>
                    </div>
                  );
                })()}
                <button className="sidebar__file-item-name" onClick={this.handleFileClick}>{this.props.name}</button>
                <input
                  type="text"
                  className="sidebar__file-item-input"
                  value={this.props.name}
                  onChange={this.handleFileNameChange}
                  ref={(element) => { this.fileNameInput = element; }}
                  onBlur={() => {
                    this.validateFileName();
                    this.props.hideEditFileName(this.props.id);
                  }}
                  onKeyPress={this.handleKeyPress}
                />
                <button
                  className="sidebar__file-item-show-options"
                  aria-label="view file options"
                  ref={(element) => { this[`fileOptions-${this.props.id}`] = element; }}
                  tabIndex="0"
                  onClick={this.toggleFileOptions}
                  onBlur={() => setTimeout(() => this.props.hideFileOptions(this.props.id), 200)}
                >
                  <InlineSVG src={downArrowUrl} />
                </button>
                <div className="sidebar__file-item-options">
                  <ul title="file options">
                    {(() => { // eslint-disable-line
                      if (this.props.fileType === 'folder') {
                        return (
                          <li>
                            <button
                              aria-label="add file"
                              onClick={this.props.newFile}
                              className="sidebar__file-item-option"
                            >
                              Add File
                            </button>
                          </li>
                        );
                      }
                    })()}
                    {(() => { // eslint-disable-line
                      if (this.props.fileType === 'folder') {
                        return (
                          <li>
                            <button
                              aria-label="add folder"
                              onClick={this.props.newFolder}
                              className="sidebar__file-item-option"
                            >
                              Add Folder
                            </button>
                          </li>
                        );
                      }
                    })()}
                    <li>
                      <button
                        onClick={() => {
                          this.originalFileName = this.props.name;
                          this.props.showEditFileName(this.props.id);
                          setTimeout(() => this.fileNameInput.focus(), 0);
                        }}
                        className="sidebar__file-item-option"
                      >
                        Rename
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${this.props.name}?`)) {
                            this.isDeleting = true;
                            this.props.resetSelectedFile(this.props.id);
                            setTimeout(() => this.props.deleteFile(this.props.id, this.props.parentId), 100);
                          }
                        }}
                        className="sidebar__file-item-option"
                      >
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (this.props.children) {
            return (
              <ul className="file-item__children">
                {this.props.children.map(this.renderChild)}
              </ul>
            );
          }
        })()}
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
  isOptionsOpen: PropTypes.bool,
  isEditingName: PropTypes.bool,
  isFolderClosed: PropTypes.bool,
  setSelectedFile: PropTypes.func.isRequired,
  showFileOptions: PropTypes.func.isRequired,
  hideFileOptions: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  showEditFileName: PropTypes.func.isRequired,
  hideEditFileName: PropTypes.func.isRequired,
  updateFileName: PropTypes.func.isRequired,
  resetSelectedFile: PropTypes.func.isRequired,
  newFile: PropTypes.func.isRequired,
  newFolder: PropTypes.func.isRequired,
  showFolderChildren: PropTypes.func.isRequired,
  hideFolderChildren: PropTypes.func.isRequired
};

FileNode.defaultProps = {
  id: '1',
  name: 'test',
  fileType: 'file',
  children: [],
  parentId: '0',
  isSelectedFile: false,
  isOptionsOpen: false,
  isEditingName: false,
  isFolderClosed: false
};

function mapStateToProps(state, ownProps) {
                                                            // this is a hack, state is updated before ownProps
  return state.files.find(file => file.id === ownProps.id) || { ...ownProps, name: 'test', fileType: 'file' };
  // return state.files.find(file => file.id === ownProps.id);
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign(FileActions, IDEActions), dispatch);
}

const ConnectedFileNode = connect(mapStateToProps, mapDispatchToProps)(FileNode);
export default ConnectedFileNode;
