import React from 'react'
import { bindActionCreators } from 'redux'
import {reduxForm} from 'redux-form'
import * as UserActions from '../../redux/actions/user'
import LoginForm from '../../components/LoginForm/LoginForm'

class LoginView extends React.Component {
	render() {
		return (
			<div className="login">
				<h1>Login</h1>
				<LoginForm {...this.props} />
			</div>
		)
	}
}

function mapStateToProps(state) {
	return {
		user: state.user
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(UserActions, dispatch);
}

function validate(formProps) {
	const errors = {};
	return errors;
}

export default reduxForm({
	form: 'login',
	fields: ['email', 'password'],
	validate
}, mapStateToProps, mapDispatchToProps)(LoginView);