import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classNames from 'classnames';
import * as IDEActions from '../actions/ide';
import * as preferenceActions from '../actions/preferences';
import * as projectActions from '../actions/project';

import PlayIcon from '../../../images/play.svg';
import StopIcon from '../../../images/stop.svg';
import PreferencesIcon from '../../../images/preferences.svg';
import EditProjectNameIcon from '../../../images/pencil.svg';

class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleProjectNameChange = this.handleProjectNameChange.bind(this);
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.props.hideEditProjectName();
    }
  }

  handleProjectNameChange(event) {
    this.props.setProjectName(event.target.value);
  }

  validateProjectName() {
    if ((this.props.project.name.trim()).length === 0) {
      this.props.setProjectName(this.originalProjectName);
    }
  }

  canEditProjectName() {
    return (this.props.owner && this.props.owner.username
      && this.props.owner.username === this.props.currentUser)
      || !this.props.owner || !this.props.owner.username;
  }

  render() {
    const playButtonClass = classNames({
      'toolbar__play-button': true,
      'toolbar__play-button--selected': this.props.isPlaying
    });
    const stopButtonClass = classNames({
      'toolbar__stop-button': true,
      'toolbar__stop-button--selected': !this.props.isPlaying
    });
    const preferencesButtonClass = classNames({
      'toolbar__preferences-button': true,
      'toolbar__preferences-button--selected': this.props.preferencesIsVisible
    });
    const nameContainerClass = classNames({
      'toolbar__project-name-container': true,
      'toolbar__project-name-container--editing': this.props.project.isEditingName
    });

    return (
      <div className="toolbar">
        <button
          className="toolbar__play-sketch-button"
          onClick={() => {
            this.props.startAccessibleSketch();
            this.props.setTextOutput(true);
            this.props.setGridOutput(true);
          }}
          aria-label="play sketch"
          disabled={this.props.infiniteLoop}
        >
          <PlayIcon title="Play Sketch" />
        </button>
        <button
          className={playButtonClass}
          onClick={this.props.startSketch}
          aria-label="play only visual sketch"
          disabled={this.props.infiniteLoop}
        >
          <PlayIcon title="Play only visual Sketch" />
        </button>
        <button
          className={stopButtonClass}
          onClick={this.props.stopSketch}
          aria-label="stop sketch"
        >
          <StopIcon alt="Stop Sketch" />
        </button>
        <div className="toolbar__autorefresh">
          <input
            id="autorefresh"
            type="checkbox"
            checked={this.props.autorefresh}
            onChange={(event) => {
              this.props.setAutorefresh(event.target.checked);
            }}
          />
          <label htmlFor="autorefresh" className="toolbar__autorefresh-label">
            Auto-refresh
          </label>
        </div>
        <div className={nameContainerClass}>
          <a
            className="toolbar__project-name"
            href={this.props.owner ? `/${this.props.owner.username}/sketches/${this.props.project.id}` : ''}
            onClick={(e) => {
              if (this.canEditProjectName()) {
                e.preventDefault();
                this.originalProjectName = this.props.project.name;
                this.props.showEditProjectName();
                setTimeout(() => this.projectNameInput.focus(), 0);
              }
            }}
          >
            <span>{this.props.project.name}</span>
            {
              this.canEditProjectName() &&
              <EditProjectNameIcon className="toolbar__edit-name-button" title="Edit Project Name" />
            }
          </a>
          <input
            type="text"
            maxLength="128"
            className="toolbar__project-name-input"
            value={this.props.project.name}
            onChange={this.handleProjectNameChange}
            ref={(element) => { this.projectNameInput = element; }}
            onBlur={() => {
              this.validateProjectName();
              this.props.hideEditProjectName();
              if (this.props.project.id) {
                this.props.saveProject();
              }
            }}
            onKeyPress={this.handleKeyPress}
          />
          {(() => { // eslint-disable-line
            if (this.props.owner) {
              return (
                <p className="toolbar__project-owner">
                  by <Link to={`/${this.props.owner.username}/sketches`}>{this.props.owner.username}</Link>
                </p>
              );
            }
          })()}
        </div>
        <button
          className={preferencesButtonClass}
          onClick={this.props.openPreferences}
          aria-label="preferences"
        >
          <PreferencesIcon role="img" />
        </button>
      </div>
    );
  }
}

Toolbar.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  preferencesIsVisible: PropTypes.bool.isRequired,
  stopSketch: PropTypes.func.isRequired,
  setProjectName: PropTypes.func.isRequired,
  openPreferences: PropTypes.func.isRequired,
  owner: PropTypes.shape({
    username: PropTypes.string
  }),
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    isEditingName: PropTypes.bool,
    id: PropTypes.string,
  }).isRequired,
  showEditProjectName: PropTypes.func.isRequired,
  hideEditProjectName: PropTypes.func.isRequired,
  infiniteLoop: PropTypes.bool.isRequired,
  autorefresh: PropTypes.bool.isRequired,
  setAutorefresh: PropTypes.func.isRequired,
  setTextOutput: PropTypes.func.isRequired,
  setGridOutput: PropTypes.func.isRequired,
  startSketch: PropTypes.func.isRequired,
  startAccessibleSketch: PropTypes.func.isRequired,
  saveProject: PropTypes.func.isRequired,
  currentUser: PropTypes.string
};

Toolbar.defaultProps = {
  owner: undefined,
  currentUser: undefined
};

function mapStateToProps(state) {
  return {
    autorefresh: state.preferences.autorefresh,
    currentUser: state.user.username,
    infiniteLoop: state.ide.infiniteLoop,
    isPlaying: state.ide.isPlaying,
    owner: state.project.owner,
    preferencesIsVisible: state.ide.preferencesIsVisible,
    project: state.project,
  };
}

const mapDispatchToProps = {
  ...IDEActions,
  ...preferenceActions,
  ...projectActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
