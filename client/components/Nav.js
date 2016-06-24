import React from 'react';
import { Link } from 'react-router';

class Nav extends React.Component {
  render() {
    return (
      <nav className="nav">
        <ul className="nav__items-left">
          <li className="nav__item">
            <p
              className="nav__new"
              onClick={this.props.createProject}
            >
              New
            </p>
          </li>
          <li className="nav__item">
            <p
              className="nav__save"
              onClick={this.props.saveProject}
            >
              Save
            </p>
          </li>
        </ul>
        <ul className="nav__items-right">
          <li className="nav__item">
            {this.props.user.authenticated && <p>Hello, {this.props.user.username}!</p>}
            {!this.props.user.authenticated && <p><Link to="/login">Login</Link> or <Link to="/signup">Sign Up</Link></p>}
          </li>
        </ul>
      </nav>
    );
  }
}

export default Nav;
