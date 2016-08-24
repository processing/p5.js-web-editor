import React, { PropTypes } from 'react';
import classNames from 'classnames';
import InlineSVG from 'react-inlinesvg';
// import SidebarItem from './SidebarItem';
const rightArrowUrl = require('../../../images/right-arrow.svg');
const leftArrowUrl = require('../../../images/left-arrow.svg');
import ConnectedFileNode from './FileNode';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.resetSelectedFile = this.resetSelectedFile.bind(this);
  }

  resetSelectedFile() {
    this.props.setSelectedFile(this.props.files[1].id);
  }

  render() {
    const sidebarClass = classNames({
      sidebar: true,
      'sidebar--contracted': !this.props.isExpanded
    });

    return (
      <nav className={sidebarClass} title="file-navigation" role="navigation">
        <div className="sidebar__header">
          <h3 className="sidebar__title">Sketch Files</h3>
          <div className="sidebar__icons">
            <button
              aria-label="add file"
              className="sidebar__add"
              onClick={this.props.newFile}
            >
              +
            </button>
            <button
              aria-label="collapse file navigation"
              className="sidebar__contract"
              onClick={this.props.collapseSidebar}
            >
              <InlineSVG src={leftArrowUrl} />
            </button>
            <button
              aria-label="expand file navigation"
              className="sidebar__expand"
              onClick={this.props.expandSidebar}
            >
              <InlineSVG src={rightArrowUrl} />
            </button>
          </div>
        </div>
        { /* <ul className="sidebar__file-list" title="project files">
          {this.props.files.map((file, fileIndex) =>
            <SidebarItem
              key={file.id}
              file={file}
              setSelectedFile={this.props.setSelectedFile}
              fileIndex={fileIndex}
              showFileOptions={this.props.showFileOptions}
              hideFileOptions={this.props.hideFileOptions}
              deleteFile={this.props.deleteFile}
              resetSelectedFile={this.resetSelectedFile}
              showEditFileName={this.props.showEditFileName}
              hideEditFileName={this.props.hideEditFileName}
              updateFileName={this.props.updateFileName}
            />
          )}
        </ul> */ }
        <ConnectedFileNode id={this.props.files.filter(file => file.name === 'root')[0].id} />
      </nav>
    );
  }
}

Sidebar.propTypes = {
  files: PropTypes.array.isRequired,
  setSelectedFile: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  newFile: PropTypes.func.isRequired,
  collapseSidebar: PropTypes.func.isRequired,
  expandSidebar: PropTypes.func.isRequired,
  showFileOptions: PropTypes.func.isRequired,
  hideFileOptions: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  showEditFileName: PropTypes.func.isRequired,
  hideEditFileName: PropTypes.func.isRequired,
  updateFileName: PropTypes.func.isRequired
};

export default Sidebar;
