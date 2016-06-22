import React from 'react'

class SignupForm extends React.Component {
	render() {
		const {fields: { username, email, password, confirmPassword }, handleSubmit} = this.props;
		return (
			<form className="signup-form" onSubmit={handleSubmit(this.props.signUpUser.bind(this))}>
				<p className="signup-form__field">
					<label className="signup-form__username-label" for="username">Username:</label>
					<input className="signup-form__username-input" id="username" type="text" placeholder="Username" {...username}/>
				</p>
				<p className="signup-form__field">
					<label className="signup-form__email-label" for="email">Email:</label>
					<input className="signup-form__email-input" id="email" type="text" placeholder="Email" {...email}/>
				</p>
				<p className="signup-form__field">
					<label className="signup-form__password-label" for="password">Password:</label>
					<input className="signup-form__password-input" id="password" type="password" placeholder="Password" {...password}/>
				</p>
				<p className="signup-form__field">
					<label className="signup-form__confirm-password-label" for="confirm-password">Confirm Password:</label>
					<input className="signup-form__confirm-password-input" id="confirm-password" type="password" placeholder="Confirm Password" {...confirmPassword}/>
				</p>
				<input type="submit" value="Sign Up" />
			</form>
		)
	}
}

export default SignupForm;