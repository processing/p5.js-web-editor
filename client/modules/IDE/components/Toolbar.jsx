import React, { PropTypes } from 'react';
import { Link } from 'react-router';
const InlineSVG = require('react-inlinesvg');
const playUrl = require('../../../images/play.svg');
const logoUrl = require('../../../images/p5js-logo.svg');
const stopUrl = require('../../../images/stop.svg');
const preferencesUrl = require('../../../images/preferences.svg');
const editProjectNameUrl = require('../../../images/pencil.svg');
import classNames from 'classnames';

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
    if (this.props.project.name === '') {
      this.props.setProjectName(this.originalProjectName);
    }
  }

  canEditProjectName() {
    return (this.props.owner && this.props.owner.username
      && this.props.owner.username === this.props.currentUser)
      || !this.props.owner || !this.props.owner.username;
  }

  render() {
    let playButtonClass = classNames({
      'toolbar__play-button': true,
      'toolbar__play-button--selected': this.props.isPlaying
    });
    let stopButtonClass = classNames({
      'toolbar__stop-button': true,
      'toolbar__stop-button--selected': !this.props.isPlaying
    });
    let preferencesButtonClass = classNames({
      'toolbar__preferences-button': true,
      'toolbar__preferences-button--selected': this.props.preferencesIsVisible
    });
    let nameContainerClass = classNames({
      'toolbar__project-name-container': true,
      'toolbar__project-name-container--editing': this.props.project.isEditingName
    });

    return (
      <div className="toolbar">
        <InlineSVG className="toolbar__logo" src={logoUrl} alt="p5js Logo" />
        <button
          className="toolbar__play-sketch-button"
          onClick={() => {
            this.props.startTextOutput();
            this.props.startSketchAndRefresh();
          }}
          aria-label="play sketch"
          disabled={this.props.infiniteLoop}
        >
          <InlineSVG src={playUrl} alt="Play Sketch" />
        </button>
        <button className={playButtonClass} onClick={this.props.startSketchAndRefresh} aria-label="play only visual sketch" disabled={this.props.infiniteLoop} >
          <InlineSVG src={playUrl} alt="Play only visual Sketch" />
        </button>
        <button
          className={stopButtonClass}
          onClick={() => { this.props.stopTextOutput(); this.props.stopSketch(); }}
          aria-label="stop sketch"
        >
          <InlineSVG src={stopUrl} alt="Stop Sketch" />
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
            href={`/projects/${this.props.project.id}`}
            onClick={(e) => {
              if (this.canEditProjectName()) {
                e.preventDefault();
                this.originalProjectName = this.props.project.name;
                this.props.showEditProjectName();
                setTimeout(() => this.refs.projectNameInput.focus(), 0);
              }
            }}
          >
            {this.props.project.name}&nbsp;
            {this.canEditProjectName() && <InlineSVG className="toolbar__edit-name-button" src={editProjectNameUrl} alt="Edit Project Name" />}
          </a>
          <input
            type="text"
            className="toolbar__project-name-input"
            value={this.props.project.name}
            onChange={this.handleProjectNameChange}
            ref="projectNameInput"
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
          <InlineSVG src={preferencesUrl} alt="Preferences" />
        </button>
      </div>
    );
  }
}

Toolbar.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  preferencesIsVisible: PropTypes.bool.isRequired,
  startSketch: PropTypes.func.isRequired,
  stopSketch: PropTypes.func.isRequired,
  startTextOutput: PropTypes.func.isRequired,
  stopTextOutput: PropTypes.func.isRequired,
  setProjectName: PropTypes.func.isRequired,
  openPreferences: PropTypes.func.isRequired,
  owner: PropTypes.shape({
    username: PropTypes.string
  }),
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    isEditingName: PropTypes.bool,
    id: PropTypes.string
  }).isRequired,
  showEditProjectName: PropTypes.func.isRequired,
  hideEditProjectName: PropTypes.func.isRequired,
  infiniteLoop: PropTypes.bool.isRequired,
  autorefresh: PropTypes.bool.isRequired,
  setAutorefresh: PropTypes.func.isRequired,
  startSketchAndRefresh: PropTypes.func.isRequired,
  saveProject: PropTypes.func.isRequired,
  currentUser: PropTypes.string
};

export default Toolbar;
