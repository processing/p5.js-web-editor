import React from 'react';

var playUrl = require('../../../images/play.svg');

class Toolbar extends React.Component {
	render() {
		return (
			<div className="toolbar">
				<img src={playUrl}/>
			</div>
		);
	}
}

export default Toolbar;