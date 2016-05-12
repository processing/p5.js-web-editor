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
			"playing": this.props.isPlaying
		});

		return (
			<div className="toolbar">
				<img className="toolbar__logo" src={logoUrl}/>
				<div className={playButtonClass} onClick={this.props.startSketch}>
					<Isvg src={playUrl} alt="Play Sketch" />
				</div>
				{ this.props.isPlaying ? 
					<div className="toolbar__stop-button" onClick={this.props.stopSketch}>
						<Isvg src={stopUrl} alt="Stop Sketch" />
					</div> 
				: null }
			</div>
		);
	}
}

export default Toolbar;