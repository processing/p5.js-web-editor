import React from 'react';

var Isvg = require('react-inlinesvg');
var playUrl = require('../../../images/play.svg');
var logoUrl = require('../../../images/p5js-logo.svg');
var stopUrl = require('../../../images/stop.svg');
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

		return (
			<div className="toolbar">
				<img className="toolbar__logo" src={logoUrl}/>
				<button className={playButtonClass} onClick={this.props.startSketch}>
					<Isvg src={playUrl} alt="Play Sketch" />
				</button>
				<button className={stopButtonClass} onClick={this.props.stopSketch}>
					<Isvg src={stopUrl} alt="Stop Sketch" />
				</button>
			</div>
		);
	}
}

export default Toolbar;
