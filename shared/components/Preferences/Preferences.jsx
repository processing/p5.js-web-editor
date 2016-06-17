import React from 'react';

var Isvg = require('react-inlinesvg');
var preferences = require('../../../images/preferences.svg');
var classNames = require('classnames');

class Preferences extends React.Component {
	render() {
		let preferencesContainerClass = classNames({
			"preferences": true,
			"preferences--selected": this.props.isPreferencesShowing
		});
		return (
			<div className={preferencesContainerClass}>
				<button className="preferences__exit-button" onClick={this.props.closePreferences}>
					X
				</button>
			</div>
		);
	}
}

export default Preferences;
