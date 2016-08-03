import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';
const downArrowUrl = require('../../../images/down-arrow.svg');

class SidebarItem extends React.Component {
  onFocus() {

  }

  render() {
    let itemClass = classNames({
      'sidebar__file-item': true,
      'sidebar__file-item--selected': this.props.file.isSelected,
      'sidebar__file-item--open': this.props.file.isOptionsOpen
    });
    return (
      <li
        className={itemClass}
        onBlur={() => this.props.hideFileOptions(this.props.file.id)}
        tabIndex={this.props.fileIndex}
      >
        <a
          onClick={() => this.props.setSelectedFile(this.props.file.id)}
        >{this.props.file.name}</a>
        <a
          className="sidebar__file-item-show-options"
          onClick={() => this.props.showFileOptions(this.props.file.id)}
        >
          <InlineSVG src={downArrowUrl} />
        </a>
        <div ref="fileOptions" className="sidebar__file-item-options">
          <ul>
            <li>
              <a>
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
    isSelected: PropTypes.bool,
    isOptionsOpen: PropTypes.bool
  }).isRequired,
  setSelectedFile: PropTypes.func.isRequired,
  fileIndex: PropTypes.number.isRequired,
  showFileOptions: PropTypes.func.isRequired,
  hideFileOptions: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  resetSelectedFile: PropTypes.func.isRequired
};

export default SidebarItem;
