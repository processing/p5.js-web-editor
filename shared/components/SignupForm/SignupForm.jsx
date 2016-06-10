import React from 'react'

class SignupForm extends React.Component {
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

export default SignupForm;