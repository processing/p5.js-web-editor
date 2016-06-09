import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as UserActions from '../../redux/actions/user'
import { reduxForm } from 'redux-form'
import SignupForm from '../../components/SignupForm/SignupForm'

class SignupView extends React.Component {
	render() {
		const {fields: { username, email, password, confirmPassword }, handleSubmit} = this.props;
		return (
			<SignupForm {...this.props} />
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
