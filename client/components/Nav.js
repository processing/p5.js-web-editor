import React, { PropTypes } from 'react';
import { Link } from 'react-router';

function Nav(props) {
  return (
    <nav className="nav" role="navigation" title="main-navigation">
      <ul className="nav__items-left" title="project-menu">
        <li className="nav__item">
          <a
            className="nav__new"
            onClick={props.newProject}
          >
            New
          </a>
        </li>
        <li className="nav__item">
          <a
            className="nav__save"
            onClick={props.saveProject}
          >
            Save
          </a>
        </li>
        {(() => { // eslint-disable-line
          if (props.project.id) {
            return (
              <li className="nav__item">
                <a className="nav__clone" onClick={props.cloneProject}>
                  Duplicate
                </a>
              </li>
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (props.project.id) {
            return (
              <li className="nav__item">
                <a className="nav__export" onClick={props.exportProjectAsZip}>
                  Download
                </a>
              </li>
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (props.project.id) {
            return (
              <li className="nav__item">
                <Link to={`/full/${props.project.id}`} target="_blank">
                  Fullscreen
                </Link>
              </li>
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (props.user.authenticated) {
            return (
              <li className="nav__item">
                <p className="nav__open">
                  <Link to="/sketches">
                    Open
                  </Link>
                </p>
              </li>
            );
          } else {
            return (
              <li className="nav__item">
                <p className="nav__open">
                  <a href="http://alpha.editor.p5js.org/p5/sketches">
                    Open
                  </a>
                </p>
              </li>
            );
          }
        })()}
        <li className="nav__item">
          <p className="nav__about">
            <Link to="/about">
              About
            </Link>
          </p>
        </li>
      </ul>
      <ul className="nav__items-right" title="user-menu">
        <li className="nav__item">
          {props.user.authenticated && <p>Hello, {props.user.username}!</p>}
          {!props.user.authenticated && <p><Link to="/login">Login</Link> or <Link to="/signup">Sign Up</Link></p>}
        </li>
      </ul>
    </nav>
  );
}

Nav.propTypes = {
  newProject: PropTypes.func.isRequired,
  saveProject: PropTypes.func.isRequired,
  exportProjectAsZip: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  user: PropTypes.shape({
    authenticated: PropTypes.bool.isRequired,
    username: PropTypes.string
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string
  })
};

export default Nav;
