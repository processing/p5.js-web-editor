import React from 'react'
import Editor from '../../components/Editor/Editor'
import PreviewFrame from '../../components/Preview/PreviewFrame'
import Toolbar from '../../components/Toolbar/Toolbar'
import Preferences from '../../components/Preferences/Preferences'
import Nav from '../../components/Nav/Nav'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as IndexActions from '../../redux/actions'
import * as ProjectActions from '../../redux/actions/project'

class IDEView extends React.Component {
	componentDidMount() {
		if (this.props.params.project_id) {
			const id = this.props.params.project_id
			this.props.getProject(id);
		}
	}

	render() {
		return (
			<div className="ide">
				<Nav user={this.props.user}
						 createProject={this.props.createProject}
						 saveProject={this.props.saveProject}/>
				<Toolbar 
					className="Toolbar"
					isPlaying={this.props.ide.isPlaying}
					startSketch={this.props.startSketch}
					stopSketch={this.props.stopSketch}
					projectName={this.props.project.name}
					setProjectName={this.props.setProjectName}
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
		preferences: state.preferences,
		user: state.user,
		project: state.project
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(Object.assign({}, IndexActions, ProjectActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(IDEView);
