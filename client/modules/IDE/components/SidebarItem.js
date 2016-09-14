import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';
const downArrowUrl = require('../../../images/down-arrow.svg');

class SidebarItem extends React.Component {
  constructor(props) {
    super(props);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.validateFileName = this.validateFileName.bind(this);
  }

  handleFileNameChange(event) {
    this.props.updateFileName(this.props.file.id, event.target.value);
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.props.hideEditFileName(this.props.file.id);
    }
  }

  validateFileName() {
    const oldFileExtension = this.originalFileName.match(/\.[0-9a-z]+$/i);
    const newFileExtension = this.props.file.name.match(/\.[0-9a-z]+$/i);
    if (oldFileExtension && !newFileExtension) {
      this.props.updateFileName(this.props.file.id, this.originalFileName);
    }
    if (oldFileExtension && newFileExtension && oldFileExtension[0] !== newFileExtension[0]) {
      this.props.updateFileName(this.props.file.id, this.originalFileName);
    }
  }

  render() {
    let itemClass = classNames({
      'sidebar__file-item': true,
      'sidebar__file-item--selected': this.props.file.isSelectedFile,
      'sidebar__file-item--open': this.props.file.isOptionsOpen,
      'sidebar__file-item--editing': this.props.file.isEditingName
    });

    return (
      <li
        className={itemClass}
        onBlur={() => setTimeout(() => this.props.hideFileOptions(this.props.file.id), 100)}
        tabIndex={this.props.fileIndex}
        onClick={() => this.props.setSelectedFile(this.props.file.id)}
      >
        <a
          className="sidebar__file-item-name"
        >{this.props.file.name}</a>
        <input
          type="text"
          className="sidebar__file-item-input"
          value={this.props.file.name}
          onChange={this.handleFileNameChange}
          ref="fileNameInput"
          onBlur={() => {
            this.validateFileName();
            this.props.hideEditFileName(this.props.file.id);
          }}
          onKeyPress={this.handleKeyPress}
        />
        <button
          className="sidebar__file-item-show-options"
          aria-label="view file options"
          onClick={() => this.props.showFileOptions(this.props.file.id)}
        >
          <InlineSVG src={downArrowUrl} />
        </button>
        <div ref="fileOptions" className="sidebar__file-item-options">
          <ul title="file options">
            <li>
              <a
                onClick={() => {
                  console.log('before show edit file name');
                  this.originalFileName = this.props.file.name;
                  this.props.showEditFileName(this.props.file.id);
                  setTimeout(() => this.refs.fileNameInput.focus(), 0);
                }}
              >
                Rename
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${this.props.file.name}?`)) {
                    this.props.deleteFile(this.props.file.id);
                    this.props.resetSelectedFile();
                  }
                }}
              >
                Delete
              </a>
            </li>
          </ul>
        </div>
      </li>
    );
  }
}

SidebarItem.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    isSelectedFile: PropTypes.bool,
    isOptionsOpen: PropTypes.bool,
    isEditingName: PropTypes.bool
  }).isRequired,
  setSelectedFile: PropTypes.func.isRequired,
  fileIndex: PropTypes.number.isRequired,
  showFileOptions: PropTypes.func.isRequired,
  hideFileOptions: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  resetSelectedFile: PropTypes.func.isRequired,
  showEditFileName: PropTypes.func.isRequired,
  hideEditFileName: PropTypes.func.isRequired,
  updateFileName: PropTypes.func.isRequired
};

export default SidebarItem;
