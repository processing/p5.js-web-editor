import Editor from '../Editor/Editor'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as FileActions from '../../redux/actions'

function mapStateToProps(state) {
	return {
		file: state.file
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(FileActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor);