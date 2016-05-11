import React from 'react';

var playUrl = require('../../../images/play.svg');
var logoUrl = require('../../../images/p5js-logo.svg');

class Toolbar extends React.Component {
	render() {
		return (
			<div className="toolbar">
				<img className="toolbar__logo" src={logoUrl}/>
				<div className="toolbar__play-button" onClick={this.props.toggleSketch}>
					<img src={playUrl}/>
				</div>
			</div>
		);
	}
}

export default Toolbar;