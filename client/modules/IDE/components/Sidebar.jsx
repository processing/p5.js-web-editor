import React, { PropTypes } from 'react';
import classNames from 'classnames';
import InlineSVG from 'react-inlinesvg';
// import SidebarItem from './SidebarItem';
const folderUrl = require('../../../images/folder.svg');
const downArrowUrl = require('../../../images/down-arrow.svg');
import ConnectedFileNode from './FileNode';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.resetSelectedFile = this.resetSelectedFile.bind(this);
    this.toggleProjectOptions = this.toggleProjectOptions.bind(this);
  }

  resetSelectedFile() {
    this.props.setSelectedFile(this.props.files[1].id);
  }

  toggleProjectOptions(e) {
    e.preventDefault();
    if (this.props.projectOptionsVisible) {
      this.props.closeProjectOptions();
    } else {
      this.refs.sidebarOptions.focus();
      this.props.openProjectOptions();
    }
  }

  render() {
    const sidebarClass = classNames({
      sidebar: true,
      'sidebar--contracted': !this.props.isExpanded,
      'sidebar--project-options': this.props.projectOptionsVisible
    });

    return (
      <nav className={sidebarClass} title="file-navigation" role="navigation">
        <div className="sidebar__header" onContextMenu={this.toggleProjectOptions}>
          <h3 className="sidebar__title">
            <span className="sidebar__folder-icon">
              <InlineSVG src={folderUrl} />
            </span>
            <span>project-folder</span>
          </h3>
          <div className="sidebar__icons">
            <button
              aria-label="add file or folder"
              className="sidebar__add"
              tabIndex="0"
              ref="sidebarOptions"
              onClick={this.toggleProjectOptions}
              onBlur={() => setTimeout(this.props.closeProjectOptions, 200)}
            >
              <InlineSVG src={downArrowUrl} />
            </button>
            <ul className="sidebar__project-options">
              <li>
                <a aria-label="add folder" onClick={this.props.newFolder} >
                  Add folder
                </a>
              </li>
              <li>
                <a aria-label="add file" onClick={this.props.newFile} >
                  Add file
                </a>
              </li>
            </ul>
          </div>
        </div>
        <ConnectedFileNode id={this.props.files.filter(file => file.name === 'root')[0].id} />
      </nav>
    );
  }
}

Sidebar.propTypes = {
  files: PropTypes.array.isRequired,
  setSelectedFile: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  projectOptionsVisible: PropTypes.bool.isRequired,
  newFile: PropTypes.func.isRequired,
  showFileOptions: PropTypes.func.isRequired,
  hideFileOptions: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  showEditFileName: PropTypes.func.isRequired,
  hideEditFileName: PropTypes.func.isRequired,
  updateFileName: PropTypes.func.isRequired,
  openProjectOptions: PropTypes.func.isRequired,
  closeProjectOptions: PropTypes.func.isRequired,
  newFolder: PropTypes.func.isRequired
};

export default Sidebar;
