import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';

const triangleUrl = require('../images/down-filled-triangle.svg');
const logoUrl = require('../images/p5js-logo-small.svg');

class Nav extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: 'none'
    };
  }

  isUserOwner() {
    return this.props.project.owner && this.props.project.owner.id === this.props.user.id;
  }

  toggleDropdown(dropdown) {
    if (this.state.dropdownOpen === 'none') {
      this.setState({
        dropdownOpen: dropdown
      });
    } else {
      this.setState({
        dropdownOpen: 'none'
      });
    }
  }

  render() {
    const navDropdownState = {
      file: classNames({
        'nav__item': true,
        'nav__item--open': this.state.dropdownOpen === 'file'
      }),
      edit: classNames({
        'nav__item': true,
        'nav__item--open': this.state.dropdownOpen === 'edit'
      }),
      sketch: classNames({
        'nav__item': true,
        'nav__item--open': this.state.dropdownOpen === 'sketch'
      }),
      help: classNames({
        'nav__item': true,
        'nav__item--open': this.state.dropdownOpen === 'help'
      }),
      account: classNames({
        'nav__item': true,
        'nav__item--open': this.state.dropdownOpen === 'account'
      })
    };
    return (
      <nav className="nav" role="navigation" title="main-navigation">
        <ul className="nav__items-left" title="project-menu">
          <li>
            <InlineSVG src={logoUrl} alt="p5.js logo" />
          </li>
          <li className={navDropdownState.file}>
            <button
              onClick={this.toggleDropdown.bind(this, 'file')}
              onBlur={this.toggleDropdown.bind(this, 'none')}
            >
              <span className="nav__item-header">File</span>
              <InlineSVG src={triangleUrl} />
            </button>
            <ul className="nav__dropdown">
              <li className="nav__dropdown-heading">
                <span>File</span>
                <InlineSVG src={triangleUrl} />
              </li>
              <li className="nav__dropdown-item">
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
              { (!this.props.project.owner || this.isUserOwner()) &&
              <li className="nav__dropdown-item">
                <button
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
              </li> }
              { this.props.project.id && this.props.user.authenticated &&
              <li className="nav__dropdown-item">
                <button onClick={this.props.cloneProject}>
                  Duplicate
                </button>
              </li> }
              { this.props.project.id &&
              <li className="nav__dropdown-item">
                <button onClick={this.props.showShareModal}>
                  Share
                </button>
              </li> }
              { this.props.project.id &&
              <li className="nav__dropdown-item">
                <button onClick={() => this.props.exportProjectAsZip(this.props.project.id)}>
                  Download
                </button>
              </li> }
              { this.props.user.authenticated &&
              <li className="nav__dropdown-item">
                <Link to={`/${this.props.user.username}/sketches`}>
                  Open
                </Link>
              </li> }
              <li className="nav__dropdown-item">
                <Link
                  to="/p5/sketches"
                >
                  Examples
                </Link>
              </li>
            </ul>
          </li>
          <li className={navDropdownState.edit}>
            <button onClick={this.toggleDropdown.bind(this, 'edit')}>
              <span className="nav__item-header">Edit</span>
              <InlineSVG src={triangleUrl} />
            </button>
            <ul className="nav__dropdown">
              <li className="nav__dropdown-heading">
                <span>Edit</span>
                <InlineSVG src={triangleUrl} />
              </li>
              <li className="nav__dropdown-item">
                Tidy Code
              </li>
              <li className="nav__dropdown-item">
                Find
              </li>
            </ul>
          </li>
          <li className={navDropdownState.sketch}>
            <button onClick={this.toggleDropdown.bind(this, 'sketch')}>
              <span className="nav__item-header">Sketch</span>
              <InlineSVG src={triangleUrl} />
            </button>
            <ul className="nav__dropdown">
              <li className="nav__dropdown-heading">
                <span>Sketch</span>
                <InlineSVG src={triangleUrl} />
              </li>
              <li className="nav__dropdown-item">
                Run
              </li>
              <li className="nav__dropdown-item">
                Stop
              </li>
            </ul>
          </li>
          <li className={navDropdownState.help}>
            <button onClick={this.toggleDropdown.bind(this, 'help')}>
              <span className="nav__item-header">Help</span>
              <InlineSVG src={triangleUrl} />
            </button>
            <ul className="nav__dropdown">
              <li className="nav__dropdown-heading">
                <span>Help</span>
                <InlineSVG src={triangleUrl} />
              </li>
              <li className="nav__dropdown-item">
                Keyboard Shortcuts
              </li>
              <li className="nav__dropdown-item">
                <a
                  href="https://p5js.org/reference/"
                  target="_blank"
                  rel="noopener noreferrer"
                >Reference</a>
              </li>
              <li className="nav__dropdown-item">
                <Link to="/about">
                  About
                </Link>
              </li>
            </ul>
          </li>
        </ul>
        { !this.props.user.authenticated &&
          <ul className="nav__items-right" title="user-menu">
            <li className="nav__item">
              <p>
                <Link to="/login">Log in</Link>
                <span className="nav__item-spacer">or</span>
                <Link to="/signup">Sign up</Link>
              </p>
            </li>
          </ul>}
        { this.props.user.authenticated &&
          <ul className="nav__items-right" title="user-menu">
            <li className="nav__item">
              <span>Hello, {this.props.user.username}!</span>
            </li>
            <span className="nav__item-spacer">|</span>
            <li className={navDropdownState.account}>
              <button
                className="nav__item-header"
                onClick={this.toggleDropdown.bind(this, 'account')}
              >
                My Account
              </button>
              <InlineSVG src={triangleUrl} />
              <ul className="nav__dropdown">
                <li className="nav__dropdown-heading">
                  <span>My Account</span>
                  <InlineSVG src={triangleUrl} />
                </li>
                <li className="nav__dropdown-item">
                  <Link to={`/${this.props.user.username}/sketches`}>
                    My sketches
                  </Link>
                </li>
                <li className="nav__dropdown-item">
                  <Link to={`/${this.props.user.username}/assets`}>
                    My assets
                  </Link>
                </li>
                <li className="nav__dropdown-item">
                  <Link to={`/${this.props.user.username}/account`}>
                    Settings
                  </Link>
                </li>
                <li className="nav__dropdown-item">
                  <button onClick={this.props.logoutUser} >
                    Log out
                  </button>
                </li>
              </ul>
            </li>
          </ul> }
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
