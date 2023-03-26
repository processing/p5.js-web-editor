import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { autosaveProject } from '../actions/project';
import { selectActiveFile } from '../selectors/files';
import { getIsUserOwner } from '../selectors/users';

// Temporary fix: Copy autosave handling from IDEView for use in MobileIDEView.
// TODO: refactor, use shared component or hook in both places, or move into Editor.

class AutosaveHandler extends React.Component {
  componentDidUpdate(prevProps) {
    if (this.props.isUserOwner && this.props.project.id) {
      if (
        this.props.preferences.autosave &&
        this.props.ide.unsavedChanges &&
        !this.props.ide.justOpenedProject
      ) {
        if (
          this.props.selectedFile.name === prevProps.selectedFile.name &&
          this.props.selectedFile.content !== prevProps.selectedFile.content
        ) {
          if (this.autosaveInterval) {
            clearTimeout(this.autosaveInterval);
          }
          this.autosaveInterval = setTimeout(this.props.autosaveProject, 20000);
        }
      } else if (this.autosaveInterval && !this.props.preferences.autosave) {
        clearTimeout(this.autosaveInterval);
        this.autosaveInterval = null;
      }
    } else if (this.autosaveInterval) {
      clearTimeout(this.autosaveInterval);
      this.autosaveInterval = null;
    }
  }

  componentWillUnmount() {
    clearTimeout(this.autosaveInterval);
    this.autosaveInterval = null;
  }

  autosaveInterval = null;

  render() {
    return null;
  }
}

AutosaveHandler.propTypes = {
  ide: PropTypes.shape({
    justOpenedProject: PropTypes.bool.isRequired,
    unsavedChanges: PropTypes.bool.isRequired
  }).isRequired,
  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  autosaveProject: PropTypes.func.isRequired,
  isUserOwner: PropTypes.bool.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string
  }).isRequired,
  preferences: PropTypes.shape({
    autosave: PropTypes.bool.isRequired
  }).isRequired
};

function mapStateToProps(state) {
  return {
    selectedFile: selectActiveFile(state),
    ide: state.ide,
    preferences: state.preferences,
    user: state.user,
    project: state.project,
    isUserOwner: getIsUserOwner(state)
  };
}

const mapDispatchToProps = {
  autosaveProject
};

export default connect(mapStateToProps, mapDispatchToProps)(AutosaveHandler);
