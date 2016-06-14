import React from 'react'
import { Link } from 'react-router'

class Nav extends React.Component {
	render() {
		return (
			<nav className="nav">
				<ul className="nav__items">
					<li>
						{this.props.user.authenticated && <p>Hello, {this.props.user.username}!</p>}
						{!this.props.user.authenticated && <p><Link to={`/login`}>Login</Link> or <Link to={`/signup`}>Sign Up</Link></p>}
					</li>
				</ul>
			</nav>
		);
	}
}

export default Nav;