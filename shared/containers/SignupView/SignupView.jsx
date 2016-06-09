import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as UserActions from '../../redux/actions/user'
import { reduxForm } from 'redux-form'

class SignupView extends React.Component {
	render() {
		const {fields: { username, email, password, confirmPassword }, handleSubmit} = this.props;
		return (
			<form onSubmit={handleSubmit(this.props.signUpUser.bind(this))}>
				<input type="text" placeholder="Username" {...username}/>
				<input type="text" placeholder="Email" {...email}/>
				<input type="password" placeholder="Password" {...password}/>
				<input type="password" placeholder="Confirm Password" {...confirmPassword}/>
				<input type="submit" value="Sign Up" />
			</form>
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

// export default connect(mapStateToProps, mapDispatchToProps)(SignupView);
export default reduxForm({
	form: 'signup',
	fields: ['username', 'email', 'password', 'passwordConfirm'],
	validate
}, mapStateToProps, mapDispatchToProps)(SignupView);
