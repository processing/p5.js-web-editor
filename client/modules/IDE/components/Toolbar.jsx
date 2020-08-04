import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import i18n from 'i18next';
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
    this.handleProjectNameSave = this.handleProjectNameSave.bind(this);

    this.state = {
      projectNameInputValue: props.project.name,
    };
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.props.hideEditProjectName();
      this.projectNameInput.blur();
    }
  }

  handleProjectNameChange(event) {
    this.setState({ projectNameInputValue: event.target.value });
  }

  handleProjectNameSave() {
    const newProjectName = this.state.projectNameInputValue.trim();
    if (newProjectName.length === 0) {
      this.setState({
        projectNameInputValue: this.props.project.name,
      });
    } else {
      this.props.setProjectName(newProjectName);
      this.props.hideEditProjectName();
      if (this.props.project.id) {
        this.props.saveProject();
      }
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

    const canEditProjectName = this.canEditProjectName();

    return (
      <div className="toolbar">
        <button
          className="toolbar__play-sketch-button"
          onClick={() => {
            this.props.startAccessibleSketch();
            this.props.setTextOutput(true);
            this.props.setGridOutput(true);
          }}
          aria-label={i18n.t('Toolbar.PlaySketchARIA')}
          disabled={this.props.infiniteLoop}
        >
          <PlayIcon focusable="false" aria-hidden="true" />
        </button>
        <button
          className={playButtonClass}
          onClick={this.props.startSketch}
          aria-label={i18n.t('Toolbar.PlayOnlyVisualSketchARIA')}
          disabled={this.props.infiniteLoop}
        >
          <PlayIcon focusable="false" aria-hidden="true" />
        </button>
        <button
          className={stopButtonClass}
          onClick={this.props.stopSketch}
          aria-label={i18n.t('Toolbar.StopSketchARIA')}
        >
          <StopIcon focusable="false" aria-hidden="true" />
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
            {i18n.t('Toolbar.Auto-refresh')}
          </label>
        </div>
        <div className={nameContainerClass}>
          <button
            className="toolbar__project-name"
            onClick={() => {
              if (canEditProjectName) {
                this.props.showEditProjectName();
                setTimeout(() => this.projectNameInput.focus(), 0);
              }
            }}
            disabled={!canEditProjectName}
            aria-label={i18n.t('Toolbar.EditSketchARIA')}
          >
            <span>{this.props.project.name}</span>
            {
              canEditProjectName &&
              <EditProjectNameIcon
                className="toolbar__edit-name-button"
                focusable="false"
                aria-hidden="true"
              />
            }
          </button>
          <input
            type="text"
            maxLength="128"
            className="toolbar__project-name-input"
            aria-label={i18n.t('Toolbar.NewSketchNameARIA')}
            value={this.state.projectNameInputValue}
            onChange={this.handleProjectNameChange}
            ref={(element) => { this.projectNameInput = element; }}
            onBlur={this.handleProjectNameSave}
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
          aria-label="Open Preferences"
        >
          <PreferencesIcon focusable="false" aria-hidden="true" />
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

export const ToolbarComponent = Toolbar;
// export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(Toolbar));
