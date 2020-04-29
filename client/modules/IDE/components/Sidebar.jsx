import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import ConnectedFileNode from './FileNode';

import DownArrowIcon from '../../../images/down-filled-triangle.svg';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.resetSelectedFile = this.resetSelectedFile.bind(this);
    this.toggleProjectOptions = this.toggleProjectOptions.bind(this);
    this.onBlurComponent = this.onBlurComponent.bind(this);
    this.onFocusComponent = this.onFocusComponent.bind(this);

    this.state = {
      isFocused: false,
    };
  }

  onBlurComponent() {
    this.setState({ isFocused: false });
    setTimeout(() => {
      if (!this.state.isFocused) {
        this.props.closeProjectOptions();
      }
    }, 200);
  }

  onFocusComponent() {
    this.setState({ isFocused: true });
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
    const rootFile = this.props.files.filter(file => file.name === 'root')[0];

    return (
      <nav className={sidebarClass} title="file-navigation" >
        <div className="sidebar__header" onContextMenu={this.toggleProjectOptions}>
          <h3 className="sidebar__title">
            <span>Sketch Files</span>
          </h3>
          <div className="sidebar__icons">
            <button
              aria-label="add file or folder"
              className="sidebar__add"
              tabIndex="0"
              ref={(element) => { this.sidebarOptions = element; }}
              onClick={this.toggleProjectOptions}
              onBlur={this.onBlurComponent}
              onFocus={this.onFocusComponent}
            >
              <DownArrowIcon />
            </button>
            <ul className="sidebar__project-options">
              <li>
                <button
                  aria-label="add folder"
                  onClick={() => {
                    this.props.newFolder(rootFile.id);
                    setTimeout(this.props.closeProjectOptions, 0);
                  }}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  Create folder
                </button>
              </li>
              <li>
                <button
                  aria-label="add file"
                  onClick={() => {
                    this.props.newFile(rootFile.id);
                    setTimeout(this.props.closeProjectOptions, 0);
                  }}
                  onBlur={this.onBlurComponent}
                  onFocus={this.onFocusComponent}
                >
                  Create file
                </button>
              </li>
              {
                this.props.user.authenticated &&
                <li>
                  <button
                    aria-label="upload file"
                    onClick={() => {
                      this.props.openUploadFileModal(rootFile.id);
                      setTimeout(this.props.closeProjectOptions, 0);
                    }}
                    onBlur={this.onBlurComponent}
                    onFocus={this.onFocusComponent}
                  >
                    Upload file
                  </button>
                </li>
              }
            </ul>
          </div>
        </div>
        <ConnectedFileNode
          id={rootFile.id}
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
  openUploadFileModal: PropTypes.func.isRequired,
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
