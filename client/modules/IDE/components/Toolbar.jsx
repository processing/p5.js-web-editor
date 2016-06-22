import React from 'react';

var Isvg = require('react-inlinesvg');
var playUrl = require('../../../images/play.svg');
var logoUrl = require('../../../images/p5js-logo.svg');
var stopUrl = require('../../../images/stop.svg');
var preferencesUrl = require('../../../images/preferences.svg');
var classNames = require('classnames');

class Toolbar extends React.Component {
	render() {
		let playButtonClass = classNames({
			"toolbar__play-button": true,
			"toolbar__play-button--selected": this.props.isPlaying
		});
		let stopButtonClass = classNames({
			"toolbar__stop-button": true,
			"toolbar__stop-button--selected": !this.props.isPlaying
		});
		let preferencesButtonClass = classNames({
			"toolbar__preferences-button": true,
			"toolbar__preferences-button--selected": this.props.isPreferencesVisible
		});

		return (
			<div className="toolbar">
				<img className="toolbar__logo" src={logoUrl} alt="p5js Logo"/>
				<button className={playButtonClass} onClick={this.props.startSketch}>
					<Isvg src={playUrl} alt="Play Sketch" />
				</button>
				<button className={stopButtonClass} onClick={this.props.stopSketch}>
					<Isvg src={stopUrl} alt="Stop Sketch" />
				</button>
				<div className="toolbar__project-name-container">
					<span className="toolbar__project-name"
								onBlur={this.props.setProjectName.bind(this)}
								contentEditable={true}
								suppressContentEditableWarning={true}>
								{this.props.projectName}
					</span>
				</div>
				<button className={preferencesButtonClass} onClick={this.props.openPreferences}>
					<Isvg src={preferencesUrl} alt="Show Preferences" />
				</button>
			</div>
		);
	}
}

export default Toolbar;
