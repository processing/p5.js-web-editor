import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import { languageKeyToLabel } from '../i18n';
import * as IDEActions from '../modules/IDE/actions/ide';
import * as toastActions from '../modules/IDE/actions/toast';
import * as projectActions from '../modules/IDE/actions/project';
import { setAllAccessibleOutput, setLanguage } from '../modules/IDE/actions/preferences';
import { logoutUser } from '../modules/User/actions';

import getConfig from '../utils/getConfig';
import { metaKeyName, } from '../utils/metaKey';
import { getIsUserOwner } from '../modules/IDE/selectors/users';

import CaretLeftIcon from '../images/left-arrow.svg';
import TriangleIcon from '../images/down-filled-triangle.svg';
import LogoIcon from '../images/p5js-logo-small.svg';

class Nav extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: 'none'
    };
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.clearHideTimeout = this.clearHideTimeout.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleNew = this.handleNew.bind(this);
    this.handleDuplicate = this.handleDuplicate.bind(this);
    this.handleShare = this.handleShare.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    this.handleFind = this.handleFind.bind(this);
    this.handleAddFile = this.handleAddFile.bind(this);
    this.handleAddFolder = this.handleAddFolder.bind(this);
    this.handleFindNext = this.handleFindNext.bind(this);
    this.handleRun = this.handleRun.bind(this);
    this.handleFindPrevious = this.handleFindPrevious.bind(this);
    this.handleReplace = this.handleReplace.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.handleStartAccessible = this.handleStartAccessible.bind(this);
    this.handleStopAccessible = this.handleStopAccessible.bind(this);
    this.handleKeyboardShortcuts = this.handleKeyboardShortcuts.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.toggleDropdownForFile = this.toggleDropdown.bind(this, 'file');
    this.handleFocusForFile = this.handleFocus.bind(this, 'file');
    this.setDropdownForNone = this.setDropdown.bind(this, 'none');
    this.toggleDropdownForEdit = this.toggleDropdown.bind(this, 'edit');
    this.handleFocusForEdit = this.handleFocus.bind(this, 'edit');
    this.toggleDropdownForSketch = this.toggleDropdown.bind(this, 'sketch');
    this.handleFocusForSketch = this.handleFocus.bind(this, 'sketch');
    this.toggleDropdownForHelp = this.toggleDropdown.bind(this, 'help');
    this.handleFocusForHelp = this.handleFocus.bind(this, 'help');
    this.toggleDropdownForAccount = this.toggleDropdown.bind(this, 'account');
    this.handleFocusForAccount = this.handleFocus.bind(this, 'account');
    this.toggleDropdownForLang = this.toggleDropdown.bind(this, 'lang');
    this.handleFocusForLang = this.handleFocus.bind(this, 'lang');
    this.handleLangSelection = this.handleLangSelection.bind(this);

    this.closeDropDown = this.closeDropDown.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClick, false);
    document.addEventListener('keydown', this.closeDropDown, false);
  }
  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false);
    document.removeEventListener('keydown', this.closeDropDown, false);
  }
  setDropdown(dropdown) {
    this.setState({
      dropdownOpen: dropdown
    });
  }

  closeDropDown(e) {
    if (e.keyCode === 27) {
      this.setDropdown('none');
    }
  }

  handleClick(e) {
    if (!this.node) {
      return;
    }
    if (this.node && this.node.contains(e.target)) {
      return;
    }

    this.handleClickOutside();
  }

  handleNew() {
    const { unsavedChanges, warnIfUnsavedChanges } = this.props;
    if (!unsavedChanges) {
      this.props.showToast(1500);
      this.props.setToastText('Toast.OpenedNewSketch');
      this.props.newProject();
    } else if (warnIfUnsavedChanges && warnIfUnsavedChanges()) {
      this.props.showToast(1500);
      this.props.setToastText('Toast.OpenedNewSketch');
      this.props.newProject();
    }
    this.setDropdown('none');
  }

  handleSave() {
    if (this.props.user.authenticated) {
      this.props.saveProject(this.props.cmController.getContent());
    } else {
      this.props.showErrorModal('forceAuthentication');
    }
    this.setDropdown('none');
  }

  handleFind() {
    this.props.cmController.showFind();
    this.setDropdown('none');
  }

  handleFindNext() {
    this.props.cmController.findNext();
    this.setDropdown('none');
  }

  handleFindPrevious() {
    this.props.cmController.findPrev();
    this.setDropdown('none');
  }

  handleReplace() {
    this.props.cmController.showReplace();
    this.setDropdown('none');
  }

  handleAddFile() {
    this.props.newFile(this.props.rootFile.id);
    this.setDropdown('none');
  }

  handleAddFolder() {
    this.props.newFolder(this.props.rootFile.id);
    this.setDropdown('none');
  }

  handleRun() {
    this.props.startSketch();
    this.setDropdown('none');
  }

  handleStop() {
    this.props.stopSketch();
    this.setDropdown('none');
  }

  handleStartAccessible() {
    this.props.setAllAccessibleOutput(true);
    this.setDropdown('none');
  }

  handleStopAccessible() {
    this.props.setAllAccessibleOutput(false);
    this.setDropdown('none');
  }

  handleKeyboardShortcuts() {
    this.props.showKeyboardShortcutModal();
    this.setDropdown('none');
  }

  handleLangSelection(event) {
    this.props.setLanguage(event.target.value);
    this.props.showToast(1500);
    this.props.setToastText('Toast.LangChange');
    this.setDropdown('none');
  }

  handleLogout() {
    this.props.logoutUser();
    this.setDropdown('none');
  }

  handleDownload() {
    this.props.autosaveProject();
    projectActions.exportProjectAsZip(this.props.project.id);
    this.setDropdown('none');
  }

  handleDuplicate() {
    this.props.cloneProject();
    this.setDropdown('none');
  }

  handleShare() {
    const { username } = this.props.params;
    this.props.showShareModal(this.props.project.id, this.props.project.name, username);
    this.setDropdown('none');
  }

  handleClickOutside() {
    this.setState({
      dropdownOpen: 'none'
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

  renderDashboardMenu(navDropdownState) {
    return (
      <ul className="nav__items-left">
        <li className="nav__item-logo">
          <LogoIcon role="img" aria-label={this.props.t('Common.p5logoARIA')} focusable="false" className="svg__logo" />
        </li>
        <li className="nav__item nav__item--no-icon">
          <Link to="/" className="nav__back-link">
            <CaretLeftIcon className="nav__back-icon" focusable="false" aria-hidden="true" />
            <span className="nav__item-header">
              {this.props.t('Nav.BackEditor')}
            </span>
          </Link>
        </li>
      </ul>
    );
  }

  renderProjectMenu(navDropdownState) {
    return (
      <ul className="nav__items-left">
        <li className="nav__item-logo">
          <LogoIcon role="img" aria-label={this.props.t('Common.p5logoARIA')} focusable="false" className="svg__logo" />
        </li>
        <li className={navDropdownState.file}>
          <button
            onClick={this.toggleDropdownForFile}
            onBlur={this.handleBlur}
            onFocus={this.clearHideTimeout}
            onMouseOver={() => {
              if (this.state.dropdownOpen !== 'none') {
                this.setDropdown('file');
              }
            }}
          >
            <span className="nav__item-header">{this.props.t('Nav.File.Title')}</span>
            <TriangleIcon className="nav__item-header-triangle" focusable="false" aria-hidden="true" />
          </button>
          <ul className="nav__dropdown">
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleNew}
                onFocus={this.handleFocusForFile}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.File.New')}
              </button>
            </li>
            { getConfig('LOGIN_ENABLED') && (!this.props.project.owner || this.props.isUserOwner) &&
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleSave}
                onFocus={this.handleFocusForFile}
                onBlur={this.handleBlur}
              >
                {this.props.t('Common.Save')}
                <span className="nav__keyboard-shortcut">{metaKeyName}+S</span>
              </button>
            </li> }
            { this.props.project.id && this.props.user.authenticated &&
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleDuplicate}
                onFocus={this.handleFocusForFile}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.File.Duplicate')}
              </button>
            </li> }
            { this.props.project.id &&
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleShare}
                onFocus={this.handleFocusForFile}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.File.Share')}
              </button>
            </li> }
            { this.props.project.id &&
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleDownload}
                onFocus={this.handleFocusForFile}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.File.Download')}
              </button>
            </li> }
            { this.props.user.authenticated &&
            <li className="nav__dropdown-item">
              <Link
                to={`/${this.props.user.username}/sketches`}
                onFocus={this.handleFocusForFile}
                onBlur={this.handleBlur}
                onClick={this.setDropdownForNone}
              >
                {this.props.t('Nav.File.Open')}
              </Link>
            </li> }
            {getConfig('UI_COLLECTIONS_ENABLED') &&
              this.props.user.authenticated &&
              this.props.project.id &&
              <li className="nav__dropdown-item">
                <Link
                  to={`/${this.props.user.username}/sketches/${this.props.project.id}/add-to-collection`}
                  onFocus={this.handleFocusForFile}
                  onBlur={this.handleBlur}
                  onClick={this.setDropdownForNone}
                >
                  {this.props.t('Nav.File.AddToCollection')}
                </Link>
              </li>}
            { getConfig('EXAMPLES_ENABLED') &&
            <li className="nav__dropdown-item">
              <Link
                to="/p5/sketches"
                onFocus={this.handleFocusForFile}
                onBlur={this.handleBlur}
                onClick={this.setDropdownForNone}
              >
                {this.props.t('Nav.File.Examples')}
              </Link>
            </li> }
          </ul>
        </li>
        <li className={navDropdownState.edit}>
          <button
            onClick={this.toggleDropdownForEdit}
            onBlur={this.handleBlur}
            onFocus={this.clearHideTimeout}
            onMouseOver={() => {
              if (this.state.dropdownOpen !== 'none') {
                this.setDropdown('edit');
              }
            }}
          >
            <span className="nav__item-header">{this.props.t('Nav.Edit.Title')}</span>
            <TriangleIcon className="nav__item-header-triangle" focusable="false" aria-hidden="true" />
          </button>
          <ul className="nav__dropdown" >
            <li className="nav__dropdown-item">
              <button
                onClick={() => {
                  this.props.cmController.tidyCode();
                  this.setDropdown('none');
                }}
                onFocus={this.handleFocusForEdit}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.Edit.TidyCode')}
                <span className="nav__keyboard-shortcut">{'\u21E7'}+Tab</span>
              </button>
            </li>
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleFind}
                onFocus={this.handleFocusForEdit}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.Edit.Find')}
                <span className="nav__keyboard-shortcut">{metaKeyName}+F</span>
              </button>
            </li>
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleFindNext}
                onFocus={this.handleFocusForEdit}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.Edit.FindNext')}
                <span className="nav__keyboard-shortcut">{metaKeyName}+G</span>
              </button>
            </li>
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleFindPrevious}
                onFocus={this.handleFocusForEdit}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.Edit.FindPrevious')}
                <span className="nav__keyboard-shortcut">{'\u21E7'}+{metaKeyName}+G</span>
              </button>
            </li>
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleReplace}
                onFocus={this.handleFocusForEdit}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.Edit.Replace')}
                <span className="nav__keyboard-shortcut">{metaKeyName}+R</span>
              </button>
            </li>
          </ul>
        </li>
        <li className={navDropdownState.sketch}>
          <button
            onClick={this.toggleDropdownForSketch}
            onBlur={this.handleBlur}
            onFocus={this.clearHideTimeout}
            onMouseOver={() => {
              if (this.state.dropdownOpen !== 'none') {
                this.setDropdown('sketch');
              }
            }}
          >
            <span className="nav__item-header">{this.props.t('Nav.Sketch.Title')}</span>
            <TriangleIcon className="nav__item-header-triangle" focusable="false" aria-hidden="true" />
          </button>
          <ul className="nav__dropdown">
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleAddFile}
                onFocus={this.handleFocusForSketch}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.Sketch.AddFile')}
              </button>
            </li>
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleAddFolder}
                onFocus={this.handleFocusForSketch}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.Sketch.AddFolder')}
              </button>
            </li>
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleRun}
                onFocus={this.handleFocusForSketch}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.Sketch.Run')}
                <span className="nav__keyboard-shortcut">{metaKeyName}+Enter</span>
              </button>
            </li>
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleStop}
                onFocus={this.handleFocusForSketch}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.Sketch.Stop')}
                <span className="nav__keyboard-shortcut">{'\u21E7'}+{metaKeyName}+Enter</span>
              </button>
            </li>
            {/* <li className="nav__dropdown-item">
              <button
                onClick={this.handleStartAccessible}
                onFocus={this.handleFocusForSketch}
                onBlur={this.handleBlur}
              >
                Start Accessible
                <span className="nav__keyboard-shortcut">{'\u21E7'}+{metaKeyName}+1</span>
              </button>
            </li>
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleStopAccessible}
                onFocus={this.handleFocusForSketch}
                onBlur={this.handleBlur}
              >
                Stop Accessible
                <span className="nav__keyboard-shortcut">{'\u21E7'}+{metaKeyName}+2</span>
              </button>
            </li> */}
          </ul>
        </li>
        <li className={navDropdownState.help}>
          <button
            onClick={this.toggleDropdownForHelp}
            onBlur={this.handleBlur}
            onFocus={this.clearHideTimeout}
            onMouseOver={() => {
              if (this.state.dropdownOpen !== 'none') {
                this.setDropdown('help');
              }
            }}
          >
            <span className="nav__item-header">{this.props.t('Nav.Help.Title')}</span>
            <TriangleIcon className="nav__item-header-triangle" focusable="false" aria-hidden="true" />
          </button>
          <ul className="nav__dropdown">
            <li className="nav__dropdown-item">
              <button
                onFocus={this.handleFocusForHelp}
                onBlur={this.handleBlur}
                onClick={this.handleKeyboardShortcuts}
              >
                {this.props.t('Nav.Help.KeyboardShortcuts')}
              </button>
            </li>
            <li className="nav__dropdown-item">
              <a
                href="https://p5js.org/reference/"
                target="_blank"
                rel="noopener noreferrer"
                onFocus={this.handleFocusForHelp}
                onBlur={this.handleBlur}
                onClick={this.setDropdownForNone}
              >{this.props.t('Nav.Help.Reference')}
              </a>
            </li>
            <li className="nav__dropdown-item">
              <Link
                to="/about"
                onFocus={this.handleFocusForHelp}
                onBlur={this.handleBlur}
                onClick={this.setDropdownForNone}
              >
                {this.props.t('Nav.Help.About')}
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    );
  }

  renderLanguageMenu(navDropdownState) {
    return (
      <React.Fragment>
        <li className={navDropdownState.lang}>
          <button
            onClick={this.toggleDropdownForLang}
            onBlur={this.handleBlur}
            onFocus={this.clearHideTimeout}
            onMouseOver={() => {
              if (this.state.dropdownOpen !== 'none') {
                this.setDropdown('lang');
              }
            }}
          >
            <span className="nav__item-header"> {languageKeyToLabel(this.props.language)}</span>
            <TriangleIcon className="nav__item-header-triangle" focusable="false" aria-hidden="true" />
          </button>
          <ul className="nav__dropdown">

            <li className="nav__dropdown-item">
              <button
                onFocus={this.handleFocusForLang}
                onBlur={this.handleBlur}
                value="en-US"
                onClick={e => this.handleLangSelection(e)}
              >English
              </button>
            </li>
            <li className="nav__dropdown-item">
              <button
                onFocus={this.handleFocusForLang}
                onBlur={this.handleBlur}
                value="es-419"
                onClick={e => this.handleLangSelection(e)}
              >
                Español
              </button>
            </li>
          </ul>
        </li>
      </React.Fragment>
    );
  }


  renderUnauthenticatedUserMenu(navDropdownState) {
    return (
      <ul className="nav__items-right" title="user-menu">
        {getConfig('TRANSLATIONS_ENABLED') && this.renderLanguageMenu(navDropdownState)}
        <li className="nav__item">
          <Link to="/login" className="nav__auth-button">
            <span className="nav__item-header">{this.props.t('Nav.Login')}</span>
          </Link>
        </li>
        <span className="nav__item-or">{this.props.t('Nav.LoginOr')}</span>
        <li className="nav__item">
          <Link to="/signup" className="nav__auth-button">
            <span className="nav__item-header">{this.props.t('Nav.SignUp')}</span>
          </Link>
        </li>
      </ul>
    );
  }

  renderAuthenticatedUserMenu(navDropdownState) {
    return (
      <ul className="nav__items-right" title="user-menu">
        {getConfig('TRANSLATIONS_ENABLED') && this.renderLanguageMenu(navDropdownState)}
        <li className={navDropdownState.account}>
          <button
            className="nav__item-header"
            onClick={this.toggleDropdownForAccount}
            onBlur={this.handleBlur}
            onFocus={this.clearHideTimeout}
            onMouseOver={() => {
              if (this.state.dropdownOpen !== 'none') {
                this.setDropdown('account');
              }
            }}
          >
            <span>{this.props.t('Nav.Auth.Hello')}, {this.props.user.username}!</span>
            <TriangleIcon className="nav__item-header-triangle" focusable="false" aria-hidden="true" />
          </button>
          <ul className="nav__dropdown">
            <li className="nav__dropdown-item">
              <Link
                to={`/${this.props.user.username}/sketches`}
                onFocus={this.handleFocusForAccount}
                onBlur={this.handleBlur}
                onClick={this.setDropdownForNone}
              >
                {this.props.t('Nav.Auth.MySketches')}
              </Link>
            </li>
            {getConfig('UI_COLLECTIONS_ENABLED') &&
              <li className="nav__dropdown-item">
                <Link
                  to={`/${this.props.user.username}/collections`}
                  onFocus={this.handleFocusForAccount}
                  onBlur={this.handleBlur}
                  onClick={this.setDropdownForNone}
                >
                  {this.props.t('Nav.Auth.MyCollections')}
                </Link>
              </li>
            }
            <li className="nav__dropdown-item">
              <Link
                to={`/${this.props.user.username}/assets`}
                onFocus={this.handleFocusForAccount}
                onBlur={this.handleBlur}
                onClick={this.setDropdownForNone}
              >
                {this.props.t('Nav.Auth.MyAssets')}
              </Link>
            </li>
            <li className="nav__dropdown-item">
              <Link
                to="/account"
                onFocus={this.handleFocusForAccount}
                onBlur={this.handleBlur}
                onClick={this.setDropdownForNone}
              >
                {this.props.t('Preferences.Settings')}
              </Link>
            </li>
            <li className="nav__dropdown-item">
              <button
                onClick={this.handleLogout}
                onFocus={this.handleFocusForAccount}
                onBlur={this.handleBlur}
              >
                {this.props.t('Nav.Auth.LogOut')}
              </button>
            </li>
          </ul>
        </li>
      </ul>
    );
  }

  renderUserMenu(navDropdownState) {
    const isLoginEnabled = getConfig('LOGIN_ENABLED');
    const isAuthenticated = this.props.user.authenticated;

    if (isLoginEnabled && isAuthenticated) {
      return this.renderAuthenticatedUserMenu(navDropdownState);
    } else if (isLoginEnabled && !isAuthenticated) {
      return this.renderUnauthenticatedUserMenu(navDropdownState);
    }

    return null;
  }

  renderLeftLayout(navDropdownState) {
    switch (this.props.layout) {
      case 'dashboard':
        return this.renderDashboardMenu(navDropdownState);
      case 'project':
      default:
        return this.renderProjectMenu(navDropdownState);
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
      }),
      lang: classNames({
        'nav__item': true,
        'nav__item--open': this.state.dropdownOpen === 'lang'
      })
    };

    return (
      <header>
        <nav className="nav" title="main-navigation" ref={(node) => { this.node = node; }}>
          {this.renderLeftLayout(navDropdownState)}
          {this.renderUserMenu(navDropdownState)}
        </nav>
      </header>
    );
  }
}

Nav.propTypes = {
  newProject: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired,
  setToastText: PropTypes.func.isRequired,
  saveProject: PropTypes.func.isRequired,
  autosaveProject: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  user: PropTypes.shape({
    authenticated: PropTypes.bool.isRequired,
    username: PropTypes.string,
    id: PropTypes.string
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    owner: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  logoutUser: PropTypes.func.isRequired,
  showShareModal: PropTypes.func.isRequired,
  showErrorModal: PropTypes.func.isRequired,
  unsavedChanges: PropTypes.bool.isRequired,
  warnIfUnsavedChanges: PropTypes.func,
  showKeyboardShortcutModal: PropTypes.func.isRequired,
  cmController: PropTypes.shape({
    tidyCode: PropTypes.func,
    showFind: PropTypes.func,
    findNext: PropTypes.func,
    findPrev: PropTypes.func,
    showReplace: PropTypes.func,
    getContent: PropTypes.func
  }),
  startSketch: PropTypes.func.isRequired,
  stopSketch: PropTypes.func.isRequired,
  setAllAccessibleOutput: PropTypes.func.isRequired,
  newFile: PropTypes.func.isRequired,
  newFolder: PropTypes.func.isRequired,
  layout: PropTypes.oneOf(['dashboard', 'project']),
  rootFile: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired,
  params: PropTypes.shape({
    username: PropTypes.string
  }),
  t: PropTypes.func.isRequired,
  setLanguage: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  isUserOwner: PropTypes.bool.isRequired
};

Nav.defaultProps = {
  project: {
    id: undefined,
    owner: undefined
  },
  cmController: {},
  layout: 'project',
  warnIfUnsavedChanges: undefined,
  params: {
    username: undefined
  }
};

function mapStateToProps(state) {
  return {
    project: state.project,
    user: state.user,
    unsavedChanges: state.ide.unsavedChanges,
    rootFile: state.files.filter(file => file.name === 'root')[0],
    language: state.preferences.language,
    isUserOwner: getIsUserOwner(state)
  };
}

const mapDispatchToProps = {
  ...IDEActions,
  ...projectActions,
  ...toastActions,
  logoutUser,
  setAllAccessibleOutput,
  setLanguage
};

export default withTranslation()(withRouter(connect(mapStateToProps, mapDispatchToProps)(Nav)));
export { Nav as NavComponent };
