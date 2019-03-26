import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import InlineSVG from 'react-inlinesvg';
import ConnectedFileNode from './FileNode';

const folderUrl = require('../../../images/folder.svg');
const downArrowUrl = require('../../../images/down-arrow.svg');

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.resetSelectedFile = this.resetSelectedFile.bind(this);
    this.toggleProjectOptions = this.toggleProjectOptions.bind(this);
    this.blurComponent = this.blurComponent.bind(this);

    this.state = {
      isFocused: false,
    };
  }

  blurComponent() {
    this.setState({ isFocused: false });
    setTimeout(() => {
      if (!this.state.isFocused) {
        this.props.closeProjectOptions();
      }
    }, 200);
  }

  resetSelectedFile() {
    this.props.setSelectedFile(this.props.files[1].id);
  }

  toggleProjectOptions(e) {
    e.preventDefault();
    if (this.props.projectOptionsVisible) {
      this.props.closeProjectOptions();
    } else {
      this.sidebarOptions.focus();
      this.props.openProjectOptions();
    }
  }

  userCanEditProject() {
    let canEdit;
    if (!this.props.owner) {
      canEdit = true;
    } else if (this.props.user.authenticated && this.props.owner.id === this.props.user.id) {
      canEdit = true;
    } else {
      canEdit = false;
    }
    return canEdit;
  }

  render() {
    const canEditProject = this.userCanEditProject();
    const sidebarClass = classNames({
      'sidebar': true,
      'sidebar--contracted': !this.props.isExpanded,
      'sidebar--project-options': this.props.projectOptionsVisible,
      'sidebar--cant-edit': !canEditProject
    });

    return (
      <nav className={sidebarClass} title="file-navigation" >
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
              ref={(element) => { this.sidebarOptions = element; }}
              onClick={this.toggleProjectOptions}
              onBlur={this.blurComponent}
              onFocus={() => { this.setState({ isFocused: true }); }}
            >
              <InlineSVG src={downArrowUrl} />
            </button>
            <ul className="sidebar__project-options">
              <li>
                <button
                  aria-label="add folder"
                  onClick={() => {
                    this.props.newFolder();
                    setTimeout(this.props.closeProjectOptions, 0);
                  }}
                  onBlur={this.blurComponent}
                  onFocus={() => { this.setState({ isFocused: true }); }}
                >
                  Add folder
                </button>
              </li>
              <li>
                <button
                  aria-label="add file"
                  onClick={() => {
                    this.props.newFile();
                    setTimeout(this.props.closeProjectOptions, 0);
                  }}
                  onBlur={this.blurComponent}
                  onFocus={() => { this.setState({ isFocused: true }); }}
                >
                  Add file
                </button>
              </li>
            </ul>
          </div>
        </div>
        <ConnectedFileNode
          id={this.props.files.filter(file => file.name === 'root')[0].id}
          canEdit={canEditProject}
        />
      </nav>
    );
  }
}

Sidebar.propTypes = {
  files: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
  })).isRequired,
  setSelectedFile: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  projectOptionsVisible: PropTypes.bool.isRequired,
  newFile: PropTypes.func.isRequired,
  openProjectOptions: PropTypes.func.isRequired,
  closeProjectOptions: PropTypes.func.isRequired,
  newFolder: PropTypes.func.isRequired,
  owner: PropTypes.shape({
    id: PropTypes.string
  }),
  user: PropTypes.shape({
    id: PropTypes.string,
    authenticated: PropTypes.bool.isRequired
  }).isRequired
};

Sidebar.defaultProps = {
  owner: undefined
};

export default Sidebar;
