import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import InlineSVG from 'react-inlinesvg';
import ConnectedFileNode from './FileNode';
import LibraryManager from './LibraryManager';

const downArrowUrl = require('../../../images/down-filled-triangle.svg');

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

    return (
      <section className={sidebarClass} title="sidebar">
        <nav className="sidebar-files" title="file-navigation">
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
                    onBlur={this.onBlurComponent}
                    onFocus={this.onFocusComponent}
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
                    onBlur={this.onBlurComponent}
                    onFocus={this.onFocusComponent}
                  >
                    Add file
                  </button>
                </li>
                <li>
                  <button
                    aria-label="add library"
                    onClick={() => {
                      this.props.showAddLibraryModal();
                      setTimeout(this.props.closeProjectOptions, 0);
                    }}
                    onBlur={this.onBlurComponent}
                    onFocus={this.onFocusComponent}
                  >
                    Add library
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
        <LibraryManager />
      </section>
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
  showAddLibraryModal: PropTypes.func.isRequired,
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
