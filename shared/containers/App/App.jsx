import React from 'react';
import Editor from '../../components/Editor/Editor'
import PreviewFrame from '../../components/Preview/PreviewFrame'
import Preview from '../../components/Preview/Preview'
import Toolbar from '../../components/Toolbar/Toolbar'
import Preferences from '../../components/Preferences/Preferences'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as FileActions from '../../redux/actions'

class App extends React.Component {
	render() {
		return (
			<div className="app">
				<Toolbar
					className="toolbar"
					isPlaying={this.props.ide.isPlaying}
					startSketch={this.props.startSketch}
					stopSketch={this.props.stopSketch}
					openPreferences={this.props.openPreferences}
					isPreferencesShowing = {this.props.preferences.isPreferencesShowing}
					/>
				<Editor
					content={this.props.file.content}
					updateFile={this.props.updateFile} />
				<PreviewFrame
					content={this.props.file.content}
					head={
			      <link type='text/css' rel='stylesheet' href='preview-styles.css' />
			    }
			    isPlaying={this.props.ide.isPlaying}/>
				<Preferences
					isPreferencesShowing = {this.props.preferences.isPreferencesShowing}
					closePreferences={this.props.closePreferences}/>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		file: state.file,
		ide: state.ide,
		preferences: state.preferences
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(FileActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
