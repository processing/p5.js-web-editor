import React from 'react';

var Isvg = require('react-inlinesvg');
var playUrl = require('../../../images/play.svg');
var logoUrl = require('../../../images/p5js-logo.svg');
var stopUrl = require('../../../images/stop.svg');

class Toolbar extends React.Component {
	render() {
		return (
			<div className="toolbar">
				<img className="toolbar__logo" src={logoUrl}/>
				<div className="toolbar__play-button" onClick={this.props.toggleSketch}>
					<Isvg src={playUrl} alt="Play Sketch" />
				</div>
				{ this.props.isPlaying ? 
					<div className="toolbar__stop-button">
						<Isvg src={stopUrl} alt="Stop Sketch" />
					</div> 
				: null }
			</div>
		);
	}
}

export default Toolbar;