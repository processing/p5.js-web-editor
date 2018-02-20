import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';

import {
  metaKeyName,
} from '../utils/metaKey';

const triangleUrl = require('../images/down-filled-triangle.svg');
const logoUrl = require('../images/p5js-logo-small.svg');

class Nav extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: 'none'
    };
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.clearHideTimeout = this.clearHideTimeout.bind(this);
  }

  setDropdown(dropdown) {
    this.setState({
      dropdownOpen: dropdown
    });
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

  isUserOwner() {
    return this.props.project.owner && this.props.project.owner.id === this.props.user.id;
  }

  handleFocus(dropdown) {
    this.clearHideTimeout();
    this.setDropdown(dropdown);
  }

  clearHideTimeout() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  handleBlur() {
    this.timer = setTimeout(this.setDropdown.bind(this, 'none'), 10);
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
          <li className="nav__item-logo">
            <InlineSVG src={logoUrl} alt="p5.js logo" />
          </li>
          <li className={navDropdownState.file}>
            <button
              onClick={this.toggleDropdown.bind(this, 'file')}
              onBlur={this.handleBlur}
              onFocus={this.clearHideTimeout}
            >
              <span className="nav__item-header">File</span>
              <InlineSVG className="nav__item-header-triangle" src={triangleUrl} />
            </button>
            <ul className="nav__dropdown">
              <button
                onClick={this.toggleDropdown.bind(this, 'file')}
                className="nav__dropdown-heading"
              >
                <span>File</span>
                <InlineSVG src={triangleUrl} />
              </button>
              <li className="nav__dropdown-item">
                <button
                  onClick={() => {
                    if (!this.props.unsavedChanges) {
                      this.props.newProject();
                    } else if (this.props.warnIfUnsavedChanges()) {
                      this.props.newProject();
                    }
                    this.setDropdown('none');
                  }}
                  onFocus={this.handleFocus.bind(this, 'file')}
                  onBlur={this.handleBlur}
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
                    this.setDropdown('none');
                  }}
                  onFocus={this.handleFocus.bind(this, 'file')}
                  onBlur={this.handleBlur}
                >
                  Save
                  <span className="nav__keyboard-shortcut">{metaKeyName}+s</span>
                </button>
              </li> }
              { this.props.project.id && this.props.user.authenticated &&
              <li className="nav__dropdown-item">
                <button
                  onClick={() => {
                    this.props.cloneProject();
                    this.setDropdown('none');
                  }}
                  onFocus={this.handleFocus.bind(this, 'file')}
                  onBlur={this.handleBlur}
                >
                  Duplicate
                </button>
              </li> }
              { this.props.project.id &&
              <li className="nav__dropdown-item">
                <button
                  onClick={() => {
                    this.props.showShareModal();
                    this.setDropdown('none');
                  }}
                  onFocus={this.handleFocus.bind(this, 'file')}
                  onBlur={this.handleBlur}
                >
                  Share
                </button>
              </li> }
              { this.props.project.id &&
              <li className="nav__dropdown-item">
                <button
                  onClick={() => {
                    this.props.autosaveProject();
                    this.props.exportProjectAsZip(this.props.project.id);
                    this.setDropdown('none');
                  }}
                  onFocus={this.handleFocus.bind(this, 'file')}
                  onBlur={this.handleBlur}
                >
                  Download
                </button>
              </li> }
              { this.props.user.authenticated &&
              <li className="nav__dropdown-item">
                <Link
                  to={`/${this.props.user.username}/sketches`}
                  onFocus={this.handleFocus.bind(this, 'file')}
                  onBlur={this.handleBlur}
                  onClick={this.setDropdown.bind(this, 'none')}
                >
                  Open
                </Link>
              </li> }
              <li className="nav__dropdown-item">
                <Link
                  to="/p5/sketches"
                  onFocus={this.handleFocus.bind(this, 'file')}
                  onBlur={this.handleBlur}
                  onClick={this.setDropdown.bind(this, 'none')}
                >
                  Examples
                </Link>
              </li>
            </ul>
          </li>
          <li className={navDropdownState.edit}>
            <button
              onClick={this.toggleDropdown.bind(this, 'edit')}
              onBlur={this.handleBlur}
              onFocus={this.clearHideTimeout}
            >
              <span className="nav__item-header">Edit</span>
              <InlineSVG className="nav__item-header-triangle" src={triangleUrl} />
            </button>
            <ul className="nav__dropdown">
              <button
                onClick={this.toggleDropdown.bind(this, 'edit')}
                className="nav__dropdown-heading"
              >
                <span>Edit</span>
                <InlineSVG src={triangleUrl} />
              </button>
              <li className="nav__dropdown-item">
                <button
                  onClick={() => {
                    this.props.cmController.tidyCode();
                    this.setDropdown('none');
                  }}
                  onFocus={this.handleFocus.bind(this, 'edit')}
                  onBlur={this.handleBlur}
                >
                  Tidy Code
                  <span className="nav__keyboard-shortcut">{'\u21E7'}+Tab</span>
                </button>
              </li>
              <li className="nav__dropdown-item">
                <button
                  onClick={() => {
                    this.props.cmController.showFind();
                    this.setDropdown('none');
                  }}
                  onFocus={this.handleFocus.bind(this, 'edit')}
                  onBlur={this.handleBlur}
                >
                  Find
                  <span className="nav__keyboard-shortcut">{metaKeyName}+F</span>
                </button>
              </li>
              <li className="nav__dropdown-item">
                <button
                  onClick={() => {
                    this.props.cmController.findNext();
                    this.setDropdown('none');
                  }}
                  onFocus={this.handleFocus.bind(this, 'edit')}
                  onBlur={this.handleBlur}
                >
                  Find Next
                  <span className="nav__keyboard-shortcut">{metaKeyName}+G</span>
                </button>
              </li>
              <li className="nav__dropdown-item">
                <button
                  onClick={() => {
                    this.props.cmController.findPrev();
                    this.setDropdown('none');
                  }}
                  onFocus={this.handleFocus.bind(this, 'edit')}
                  onBlur={this.handleBlur}
                >
                  Find Previous
                  <span className="nav__keyboard-shortcut">{'\u21E7'}+{metaKeyName}+G</span>
                </button>
              </li>
            </ul>
          </li>
          <li className={navDropdownState.sketch}>
            <button
              onClick={this.toggleDropdown.bind(this, 'sketch')}
              onBlur={this.handleBlur}
              onFocus={this.clearHideTimeout}
            >
              <span className="nav__item-header">Sketch</span>
              <InlineSVG className="nav__item-header-triangle" src={triangleUrl} />
            </button>
            <ul className="nav__dropdown">
              <button
                onClick={this.toggleDropdown.bind(this, 'sketch')}
                className="nav__dropdown-heading"
              >
                <span>Sketch</span>
                <InlineSVG src={triangleUrl} />
              </button>
              <li className="nav__dropdown-item">
                <button
                  onClick={() => {
                    this.props.startSketch();
                    this.setDropdown('none');
                  }}
                  onFocus={this.handleFocus.bind(this, 'sketch')}
                  onBlur={this.handleBlur}
                >
                  Run
                  <span className="nav__keyboard-shortcut">{metaKeyName}+Enter</span>
                </button>
              </li>
              <li className="nav__dropdown-item">
                <button
                  onClick={() => {
                    this.props.stopSketch();
                    this.setDropdown('none');
                  }}
                  onFocus={this.handleFocus.bind(this, 'sketch')}
                  onBlur={this.handleBlur}
                >
                  Stop
                  <span className="nav__keyboard-shortcut">{'\u21E7'}+{metaKeyName}+Enter</span>
                </button>
              </li>
              <li className="nav__dropdown-item">
                <button
                  onClick={() => {
                    this.props.setAllAccessibleOutput(true);
                    this.setDropdown('none');
                  }}
                  onFocus={this.handleFocus.bind(this, 'sketch')}
                  onBlur={this.handleBlur}
                >
                  Start Accessible
                  <span className="nav__keyboard-shortcut">{'\u21E7'}+{metaKeyName}+1</span>
                </button>
              </li>
              <li className="nav__dropdown-item">
                <button
                  onClick={() => {
                    this.props.setAllAccessibleOutput(false);
                    this.setDropdown('none');
                  }}
                  onFocus={this.handleFocus.bind(this, 'sketch')}
                  onBlur={this.handleBlur}
                >
                  Stop Accessible
                  <span className="nav__keyboard-shortcut">{'\u21E7'}+{metaKeyName}+2</span>
                </button>
              </li>
            </ul>
          </li>
          <li className={navDropdownState.help}>
            <button
              onClick={this.toggleDropdown.bind(this, 'help')}
              onBlur={this.handleBlur}
              onFocus={this.clearHideTimeout}
            >
              <span className="nav__item-header">Help & Feedback</span>
              <InlineSVG className="nav__item-header-triangle" src={triangleUrl} />
            </button>
            <ul className="nav__dropdown">
              <button
                onClick={this.toggleDropdown.bind(this, 'help')}
                className="nav__dropdown-heading"
              >
                <span>Help & Feedback</span>
                <InlineSVG src={triangleUrl} />
              </button>
              <li className="nav__dropdown-item">
                <button
                  onClick={() => {
                    this.props.showKeyboardShortcutModal();
                    this.setDropdown('none');
                  }}
                >
                  Keyboard Shortcuts
                </button>
              </li>
              <li className="nav__dropdown-item">
                <a
                  href="https://p5js.org/reference/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onFocus={this.handleFocus.bind(this, 'help')}
                  onBlur={this.handleBlur}
                  onClick={this.setDropdown.bind(this, 'none')}
                >Reference</a>
              </li>
              <li className="nav__dropdown-item">
                <Link
                  to="/about"
                  onFocus={this.handleFocus.bind(this, 'help')}
                  onBlur={this.handleBlur}
                  onClick={this.setDropdown.bind(this, 'none')}
                >
                  About
                </Link>
              </li>
              <li className="nav__dropdown-item">
                <Link
                  to="/feedback"
                  onFocus={this.handleFocus.bind(this, 'help')}
                  onBlur={this.handleBlur}
                  onClick={this.setDropdown.bind(this, 'none')}
                >
                  Feedback
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
                onBlur={this.handleBlur}
                onFocus={this.clearHideTimeout}
              >
                My Account
              </button>
              <InlineSVG className="nav__item-header-triangle" src={triangleUrl} />
              <ul className="nav__dropdown">
                <button
                  onClick={this.toggleDropdown.bind(this, 'account')}
                  className="nav__dropdown-heading"
                >
                  <span>My Account</span>
                  <InlineSVG src={triangleUrl} />
                </button>
                <li className="nav__dropdown-item">
                  <Link
                    to={`/${this.props.user.username}/sketches`}
                    onFocus={this.handleFocus.bind(this, 'account')}
                    onBlur={this.handleBlur}
                    onClick={this.setDropdown.bind(this, 'none')}
                  >
                    My sketches
                  </Link>
                </li>
                <li className="nav__dropdown-item">
                  <Link
                    to={`/${this.props.user.username}/assets`}
                    onFocus={this.handleFocus.bind(this, 'account')}
                    onBlur={this.handleBlur}
                    onClick={this.setDropdown.bind(this, 'none')}
                  >
                    My assets
                  </Link>
                </li>
                <li className="nav__dropdown-item">
                  <Link
                    to={`/${this.props.user.username}/account`}
                    onFocus={this.handleFocus.bind(this, 'account')}
                    onBlur={this.handleBlur}
                    onClick={this.setDropdown.bind(this, 'none')}
                  >
                    Settings
                  </Link>
                </li>
                <li className="nav__dropdown-item">
                  <button
                    onClick={() => {
                      this.props.logoutUser();
                      this.setDropdown('none');
                    }}
                    onFocus={this.handleFocus.bind(this, 'account')}
                    onBlur={this.handleBlur}
                  >
                    Log out
                  </button>
                </li>
              </ul>
            </li>
          </ul> }
        {/*
        <div className="nav__announce">
          This is a preview version of the editor, that has not yet been officially released.
          It is in development, you can report bugs <a
            href="https://github.com/processing/p5.js-web-editor/issues"
            target="_blank"
            rel="noopener noreferrer"
          >here</a>.
          Please use with caution.
        </div>
      */}
      </nav>
    );
  }
}

Nav.propTypes = {
  newProject: PropTypes.func.isRequired,
  saveProject: PropTypes.func.isRequired,
  autosaveProject: PropTypes.func.isRequired,
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
  warnIfUnsavedChanges: PropTypes.func.isRequired,
  showKeyboardShortcutModal: PropTypes.func.isRequired,
  cmController: PropTypes.shape({
    tidyCode: PropTypes.func,
    showFind: PropTypes.func,
    findNext: PropTypes.func,
    findPrev: PropTypes.func
  }),
  startSketch: PropTypes.func.isRequired,
  stopSketch: PropTypes.func.isRequired,
  setAllAccessibleOutput: PropTypes.func.isRequired
};

Nav.defaultProps = {
  project: {
    id: undefined,
    owner: undefined
  },
  cmController: {}
};

export default Nav;
