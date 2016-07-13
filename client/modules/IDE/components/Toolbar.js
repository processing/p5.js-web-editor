import React, { PropTypes } from 'react';

const Isvg = require('react-inlinesvg');
const playUrl = require('../../../images/play.svg');
const logoUrl = require('../../../images/p5js-logo.svg');
const stopUrl = require('../../../images/stop.svg');
const preferencesUrl = require('../../../images/preferences.svg');
const classNames = require('classnames');

function Toolbar(props) {
  let playButtonClass = classNames({
    'toolbar__play-button': true,
    'toolbar__play-button--selected': props.isPlaying
  });
  let stopButtonClass = classNames({
    'toolbar__stop-button': true,
    'toolbar__stop-button--selected': !props.isPlaying
  });
  let preferencesButtonClass = classNames({
    'toolbar__preferences-button': true,
    'toolbar__preferences-button--selected': props.isPreferencesVisible
  });

  return (
    <div className="toolbar">
      <img className="toolbar__logo" src={logoUrl} alt="p5js Logo" />
      <button className={playButtonClass} onClick={props.startSketch}>
        <Isvg src={playUrl} alt="Play Sketch" />
      </button>
      <button className={stopButtonClass} onClick={props.stopSketch}>
        <Isvg src={stopUrl} alt="Stop Sketch" />
      </button>
      <div className="toolbar__project-name-container">
        <span
          className="toolbar__project-name"
          // TODO change this span into an input
          onBlur={props.setProjectName.bind(this)} // eslint-disable-line
          contentEditable
          suppressContentEditableWarning
        >
          {props.projectName}
        </span>
      </div>
      <button
        className={preferencesButtonClass}
        onClick={props.openPreferences}
      >
        <Isvg src={preferencesUrl} alt="Show Preferences" />
      </button>
    </div>
  );
}

Toolbar.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isPreferencesVisible: PropTypes.bool.isRequired,
  startSketch: PropTypes.func.isRequired,
  stopSketch: PropTypes.func.isRequired,
  setProjectName: PropTypes.func.isRequired,
  projectName: PropTypes.string.isRequired,
  openPreferences: PropTypes.func.isRequired
};

export default Toolbar;
