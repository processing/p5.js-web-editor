import PropTypes from 'prop-types';
import React from 'react';
import AutoRefreshCheckbox from './AutoRefreshCheckbox';
import EditableProjectName from './EditableProjectName';
import PlayButton from './PlayButton';
import PreferencesButton from './PreferencesButton';
import ProjectOwner from './ProjectOwner';
import StopButton from './StopButton';

function Toolbar({ syncFileContent }) {
  return (
    <div className="toolbar">
      <PlayButton syncFileContent={syncFileContent} />
      <StopButton />
      <AutoRefreshCheckbox />
      <div className="toolbar__project-name-container">
        <EditableProjectName />
        <ProjectOwner />
      </div>
      <PreferencesButton />
    </div>
  );
}

Toolbar.propTypes = {
  syncFileContent: PropTypes.func.isRequired
};

export default Toolbar;
