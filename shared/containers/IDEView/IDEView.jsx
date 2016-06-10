import React from 'react'
import Editor from '../../components/Editor/Editor'
import PreviewFrame from '../../components/Preview/PreviewFrame'
import Toolbar from '../../components/Toolbar/Toolbar'
import Preferences from '../../components/Preferences/Preferences'
import Nav from '../../components/Nav/Nav'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as FileActions from '../../redux/actions'

class IDEView extends React.Component {
	render() {
		return (
			<div className="ide">
				<Nav />
				<Toolbar 
					className="Toolbar"
					isPlaying={this.props.ide.isPlaying}
					startSketch={this.props.startSketch}
					stopSketch={this.props.stopSketch}
					openPreferences={this.props.openPreferences}
					isPreferencesShowing = {this.props.preferences.isPreferencesShowing}
					/>
				<Preferences
					isPreferencesShowing = {this.props.preferences.isPreferencesShowing}
					closePreferences={this.props.closePreferences}
					increaseFont={this.props.increaseFont}
					decreaseFont={this.props.decreaseFont}
					fontSize={this.props.preferences.fontSize}/>
				<Editor
					content={this.props.file.content}
					updateFile={this.props.updateFile}
					fontSize={this.props.preferences.fontSize} />
				<PreviewFrame
					content={this.props.file.content}
					head={
			      <link type='text/css' rel='stylesheet' href='preview-styles.css' />
			    }
			    isPlaying={this.props.ide.isPlaying}/>
			</div>
		)
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

export default connect(mapStateToProps, mapDispatchToProps)(IDEView);
