import React from 'react';

var Isvg = require('react-inlinesvg');
var exitUrl = require('../../../images/exit.svg');
var classNames = require('classnames');

class Preferences extends React.Component {
	render() {
		let preferencesContainerClass = classNames({
			"preferences": true,
			"preferences--selected": this.props.isPreferencesShowing
		});
		return (
			<div className={preferencesContainerClass} tabindex="0">
				<button className="preferences__exit-button" onClick={this.props.closePreferences}>
					<Isvg src={exitUrl} alt="Exit Preferences" />
				</button>
			</div>
		);
	}
}

export default Preferences;
