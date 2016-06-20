import React from 'react'
import * as ProjectActions from '../../redux/actions/project'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

class ProjectView extends React.Component {
	render() {
		return (
			<div className="project">
				<h1>{this.props.project.name}</h1>
				<p>
					{this.props.file.content}
				</p>
			</div>
		);
	}

	componentDidMount() {
		const id = this.props.params.project_id
		this.props.getProject(id);
	}
}

function mapStateToProps(state) {
	return {
		file: state.file,
		ide: state.ide,
		user: state.user,
		project: state.project
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(ProjectActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectView);

