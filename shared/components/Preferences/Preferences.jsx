import React from 'react';

var Isvg = require('react-inlinesvg');
var preferences = require('../../../images/preferences.svg');
var classNames = require('classnames');

class Preferences extends React.Component {
	render() {
		let preferencesButtonClass = classNames({
			"preferences": true,
			"preferences--selected": this.props.isPreferencesShowing
		});
		return (
			<div className={preferencesButtonClass}>
				GIANT POTATO
			</div>
		);
	}
}

export default Preferences;
