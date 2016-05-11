import React from 'react';
import Editor from '../../components/Editor/Editor'
import PreviewFrame from '../../components/Preview/PreviewFrame'
import Preview from '../../components/Preview/Preview'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as FileActions from '../../redux/actions'

class App extends React.Component {
	render() {
		return (
			<div className="app">
				<Editor 
					content={this.props.file.content}
					updateFile={this.props.updateFile} />
				<PreviewFrame 
					content={this.props.file.content} 
					head={
			      <link type='text/css' rel='stylesheet' href='preview-styles.css' />
			    }/>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		file: state.file
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(FileActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);