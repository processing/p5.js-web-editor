import React from 'react'

class SignupView extends React.Component {
	render() {
		return (
			<form onSubmit={this.handleSubmit()}>
				<input type="text" placeholder="Username"/>
				<input type="text" placeholder="Email"/>
				<input type="password" placeholder="Password"/>
				<input type="submit" value="Sign Up" />
			</form>
		)
	}
}

export default SignupView;
