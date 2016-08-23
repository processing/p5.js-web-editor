import React, { PropTypes } from 'react';
import * as FileActions from '../actions/files';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import InlineSVG from 'react-inlinesvg';
const downArrowUrl = require('../../../images/down-arrow.svg');
import classNames from 'classnames';

export class FileNode extends React.Component {
  constructor(props) {
    super(props);
    this.renderChild = this.renderChild.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.validateFileName = this.validateFileName.bind(this);
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
    if (oldFileExtension && newFileExtension && oldFileExtension[0] !== newFileExtension[0]) {
      this.props.updateFileName(this.props.id, this.originalFileName);
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
    let itemClass = classNames({
      'sidebar__file-item': true,
      'sidebar__file-item--selected': this.props.isSelected,
      'sidebar__file-item--open': this.props.isOptionsOpen,
      'sidebar__file-item--editing': this.props.isEditingName
    });
    return (
      <div className={itemClass}>
        <a className="sidebar__file-item-name">{this.props.name}</a>
        <input
          type="text"
          className="sidebar__file-item-input"
          value={this.props.name}
          onChange={this.handleFileNameChange}
          ref="fileNameInput"
          onBlur={() => {
            this.validateFileName();
            this.props.hideEditFileName(this.props.id);
          }}
          onKeyPress={this.handleKeyPress}
        />
        <button
          className="sidebar__file-item-show-options"
          aria-label="view file options"
          onClick={() => this.props.showFileOptions(this.props.id)}
        >
          <InlineSVG src={downArrowUrl} />
        </button>
        <div ref="fileOptions" className="sidebar__file-item-options">
          <ul title="file options">
            <li>
              <a
                onClick={() => {
                  console.log('before show edit file name');
                  this.originalFileName = this.props.name;
                  this.props.showEditFileName(this.props.id);
                  setTimeout(() => this.refs.fileNameInput.focus(), 0);
                }}
              >
                Rename
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${this.props.name}?`)) {
                    this.props.deleteFile(this.props.id);
                    this.props.resetSelectedFile();
                  }
                }}
              >
                Delete
              </a>
            </li>
          </ul>
        </div>
        {(() => { // eslint-disable-line
          console.log(this.props.children);
          if (this.props.children) {
            return (
              <ul>
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
  children: PropTypes.array,
  name: PropTypes.string.isRequired,
  isSelected: PropTypes.bool,
  isOptionsOpen: PropTypes.bool,
  isEditingName: PropTypes.bool,
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

function mapStateToProps(state, ownProps) {
  return state.files.find((file) => file.id === ownProps.id);
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(FileActions, dispatch);
}

const ConnectedFileNode = connect(mapStateToProps, mapDispatchToProps)(FileNode);
export default ConnectedFileNode;
