import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import InlineSVG from 'react-inlinesvg';

const triangleUrl = require('../images/down-filled-triangle.svg');
const logoUrl = require('../images/p5js-logo-small.svg');

class Nav extends React.PureComponent {
  render() {
    return (
      <nav className="nav" role="navigation" title="main-navigation">
        <ul className="nav__items-left" title="project-menu">
          <li>
            <InlineSVG src={logoUrl} alt="p5.js logo" />
          </li>
          <li className="nav__item">
            <button>
              File
              <InlineSVG src={triangleUrl} />
            </button>
            <ul className="nav__dropdown">
              <li>
                <button
                  onClick={() => {
                    if (!this.props.unsavedChanges) {
                      this.props.newProject();
                    } else if (this.props.warnIfUnsavedChanges()) {
                      this.props.newProject();
                    }
                  }}
                >
                  New
                </button>
              </li>
              <li>
                <button>
                  Save
                </button>
              </li>
              <li>
                <button>
                  Duplicate
                </button>
              </li>
              <li>
                <button>
                  Open
                </button>
              </li>
              <li>
                <button>
                  Download
                </button>
              </li>
            </ul>
          </li>
          <li className="nav__item">
            <button>
              Edit
              <InlineSVG src={triangleUrl} />
            </button>
            <ul className="nav__dropdown">
              <li>
                Tidy Code
              </li>
              <li>
                Find
              </li>
            </ul>
          </li>
          <li className="nav__item">
            <button>
              Sketch
              <InlineSVG src={triangleUrl} />
            </button>
            <ul className="nav__dropdown">
              <li>
                Run
              </li>
              <li>
                Stop
              </li>
            </ul>
          </li>
          <li className="nav__item">
            <button>
              Help
              <InlineSVG src={triangleUrl} />
            </button>
            <ul className="nav__dropdown">
              <li>
                Keyboard Shortcuts
              </li>
              <li>
                Reference
              </li>
              <li>
                About
              </li>
            </ul>
          </li>

          <li className="nav__item">
            <button
              className="nav__new"
              onClick={() => {
                if (!this.props.unsavedChanges) {
                  this.props.newProject();
                } else if (this.props.warnIfUnsavedChanges()) {
                  this.props.newProject();
                }
              }}
            >
              New
            </button>
          </li>
          {(() => { // eslint-disable-line
            if (
              !this.props.project.owner ||
              (this.props.project.owner && this.props.project.owner.id === this.props.user.id)
            ) {
              return (
                <li className="nav__item">
                  <button
                    className="nav__save"
                    onClick={() => {
                      if (this.props.user.authenticated) {
                        this.props.saveProject();
                      } else {
                        this.props.showErrorModal('forceAuthentication');
                      }
                    }}
                  >
                    Save
                  </button>
                </li>
              );
            }
          })()}
          {(() => { // eslint-disable-line
            if (this.props.project.id && this.props.user.authenticated) {
              return (
                <li className="nav__item">
                  <button className="nav__clone" onClick={this.props.cloneProject}>
                    Duplicate
                  </button>
                </li>
              );
            }
          })()}
          {(() => { // eslint-disable-line
            if (this.props.project.id) {
              return (
                <li className="nav__item">
                  <button className="nav__export" onClick={() => this.props.exportProjectAsZip(this.props.project.id)}>
                    Download
                  </button>
                </li>
              );
            }
          })()}
          {(() => { // eslint-disable-line
            if (this.props.project.id) {
              return (
                <li className="nav__item">
                  <button onClick={this.props.showShareModal}>
                    Share
                  </button>
                </li>
              );
            }
          })()}
          {(() => { // eslint-disable-line
            if (this.props.user.authenticated) {
              return (
                <li className="nav__item">
                  <p className="nav__open">
                    <Link
                      to={`/${this.props.user.username}/sketches`}
                    >
                      Open
                    </Link>
                  </p>
                </li>
              );
            }
          })()}
          <li className="nav__item">
            <p className="nav__open">
              <Link
                to="/p5/sketches"
              >
                Examples
              </Link>
            </p>
          </li>
          <li className="nav__item">
            <p className="nav__reference">
              <a
                href="https://p5js.org/reference/"
                target="_blank"
                rel="noopener noreferrer"
              >Reference</a>
            </p>
          </li>
          <li className="nav__item">
            <p className="nav__about">
              <Link to="/about">
                About
              </Link>
            </p>
          </li>
        </ul>
        <ul className="nav__items-right" title="user-menu">
          {(() => {
            if (!this.props.user.authenticated) {
              return (
                <li className="nav__item">
                  <p>
                    <Link to="/login">Log in</Link>
                    <span className="nav__item-spacer">or</span>
                    <Link to="/signup">Sign up</Link>
                  </p>
                </li>
              );
            }
            return (
              <li className="nav__item">
                <a>Hello, {this.props.user.username}!</a>
                <ul className="nav__dropdown">
                  <li className="nav__dropdown-heading">
                    <a>Hello, {this.props.user.username}!</a>
                  </li>
                  <li>
                    <Link to={`/${this.props.user.username}/sketches`}>
                      My sketches
                    </Link>
                  </li>
                  <li>
                    <Link to={`/${this.props.user.username}/assets`}>
                      My assets
                    </Link>
                  </li>
                  <li>
                    <Link to={`/${this.props.user.username}/account`}>
                      My account
                    </Link>
                  </li>
                  <li>
                    <button onClick={this.props.logoutUser} >
                      Log out
                    </button>
                  </li>
                </ul>
              </li>
            );
          })()}
        </ul>
        <div className="nav__announce">
          This is a preview version of the editor, that has not yet been officially released.
          It is in development, you can report bugs <a
            href="https://github.com/processing/p5.js-web-editor/issues"
            target="_blank"
            rel="noopener noreferrer"
          >here</a>.
          Please use with caution.
        </div>
      </nav>
    );
  }
}

Nav.propTypes = {
  newProject: PropTypes.func.isRequired,
  saveProject: PropTypes.func.isRequired,
  exportProjectAsZip: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  user: PropTypes.shape({
    authenticated: PropTypes.bool.isRequired,
    username: PropTypes.string,
    id: PropTypes.string
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    owner: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  logoutUser: PropTypes.func.isRequired,
  showShareModal: PropTypes.func.isRequired,
  showErrorModal: PropTypes.func.isRequired,
  unsavedChanges: PropTypes.bool.isRequired,
  warnIfUnsavedChanges: PropTypes.func.isRequired
};

Nav.defaultProps = {
  project: {
    id: undefined,
    owner: undefined
  }
};

export default Nav;
