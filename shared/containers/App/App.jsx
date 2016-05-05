import React from 'react';
import Editor from '../../components/Editor/Editor'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as FileActions from '../../redux/actions'

class App extends React.Component {
	render() {
		return (
			<Editor 
				content={this.props.file.content}
				updateFile={this.props.updateFile}/>
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