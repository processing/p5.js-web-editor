import React from 'react'
import { Link } from 'react-router'

class Nav extends React.Component {
	render() {
		return (
			<nav className="nav">
				<ul className="nav__items">
					<li>
						<Link to={`/login`}>Login</Link> or <Link to={`/signup`}>Sign Up</Link>
					</li>
				</ul>
			</nav>
		);
	}
}

export default Nav;