import React from 'react';
import Editor from '../../components/Editor/Editor'
import Preview from '../../components/Preview/Preview'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as FileActions from '../../redux/actions'

class App extends React.Component {
	render() {
		return (
			<div class="app">
				<Editor 
					content={this.props.file.content}
					updateFile={this.props.updateFile} />
				<Preview>
					<h1>Hello world!</h1>
				</Preview>
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