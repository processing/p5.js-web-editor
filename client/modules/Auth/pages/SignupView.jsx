import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as UserActions from '../../../redux/actions/user'
import { reduxForm } from 'redux-form'
import SignupForm from '../components/SignupForm'

class SignupView extends React.Component {
	render() {
		return (
			<div className="signup">
				<h1>Sign Up</h1>
				<SignupForm {...this.props} />
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

// export default connect(mapStateToProps, mapDispatchToProps)(SignupView);
export default reduxForm({
	form: 'signup',
	fields: ['username', 'email', 'password', 'passwordConfirm'],
	validate
}, mapStateToProps, mapDispatchToProps)(SignupView);
