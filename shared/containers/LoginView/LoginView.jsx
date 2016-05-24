import React from 'react'

class LoginView extends React.Component {
	render() {
		return (
			<form>
				<input type="text" placeholder="Username or email"/>
				<input type="password" placeholder="Password"/>
				<input type="submit" value="Log In" />
			</form>
		)
	}
}

export default LoginView;