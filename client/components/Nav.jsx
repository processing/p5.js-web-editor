import { sortBy } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router';
import { availableLanguages, languageKeyToLabel } from '../i18n';
import * as IDEActions from '../modules/IDE/actions/ide';
import * as toastActions from '../modules/IDE/actions/toast';
import * as projectActions from '../modules/IDE/actions/project';
import {
  setAllAccessibleOutput,
  setLanguage
} from '../modules/IDE/actions/preferences';
import { logoutUser } from '../modules/User/actions';

import getConfig from '../utils/getConfig';
import { metaKeyName, metaKey } from '../utils/metaKey';
import { getIsUserOwner } from '../modules/IDE/selectors/users';
import { selectSketchPath } from '../modules/IDE/selectors/project';

import CaretLeftIcon from '../images/left-arrow.svg';
import LogoIcon from '../images/p5js-logo-small.svg';
import NavDropdownMenu from './Nav/NavDropdownMenu';
import NavMenuItem from './Nav/NavMenuItem';
import NavBar from './Nav/NavBar';

class Nav extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleSave = this.handleSave.bind(this);
    this.handleNew = this.handleNew.bind(this);
    this.handleShare = this.handleShare.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    this.handleLangSelection = this.handleLangSelection.bind(this);
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
  }

  handleSave() {
    if (this.props.user.authenticated) {
      this.props.saveProject(this.props.cmController.getContent());
    } else {
      this.props.showErrorModal('forceAuthentication');
    }
  }

  handleLangSelection(event) {
    this.props.setLanguage(event.target.value);
    this.props.showToast(1500);
    this.props.setToastText('Toast.LangChange');
  }

  handleDownload() {
    this.props.autosaveProject();
    projectActions.exportProjectAsZip(this.props.project.id);
  }

  handleShare() {
    const { username } = this.props.params;
    this.props.showShareModal(
      this.props.project.id,
      this.props.project.name,
      username
    );
  }

  renderDashboardMenu() {
    return (
      <ul className="nav__items-left">
        <li className="nav__item-logo">
          <LogoIcon
            role="img"
            aria-label={this.props.t('Common.p5logoARIA')}
            focusable="false"
            className="svg__logo"
          />
        </li>
        <li className="nav__item nav__item--no-icon">
          <Link to={this.props.editorLink} className="nav__back-link">
            <CaretLeftIcon
              className="nav__back-icon"
              focusable="false"
              aria-hidden="true"
            />
            <span className="nav__item-header">
              {this.props.t('Nav.BackEditor')}
            </span>
          </Link>
        </li>
      </ul>
    );
  }

  renderProjectMenu() {
    const replaceCommand =
      metaKey === 'Ctrl' ? `${metaKeyName}+H` : `${metaKeyName}+⌥+F`;
    return (
      <ul className="nav__items-left">
        <li className="nav__item-logo">
          <LogoIcon
            role="img"
            aria-label={this.props.t('Common.p5logoARIA')}
            focusable="false"
            className="svg__logo"
          />
        </li>
        <NavDropdownMenu id="file" title={this.props.t('Nav.File.Title')}>
          <NavMenuItem onClick={this.handleNew}>
            {this.props.t('Nav.File.New')}
          </NavMenuItem>
          <NavMenuItem
            hideIf={
              !getConfig('LOGIN_ENABLED') ||
              (this.props.project.owner && !this.props.isUserOwner)
            }
            onClick={this.handleSave}
          >
            {this.props.t('Common.Save')}
            <span className="nav__keyboard-shortcut">{metaKeyName}+S</span>
          </NavMenuItem>
          <NavMenuItem
            hideIf={!this.props.project.id || !this.props.user.authenticated}
            onClick={this.props.cloneProject}
          >
            {this.props.t('Nav.File.Duplicate')}
          </NavMenuItem>
          <NavMenuItem
            hideIf={!this.props.project.id}
            onClick={this.handleShare}
          >
            {this.props.t('Nav.File.Share')}
          </NavMenuItem>
          <NavMenuItem
            hideIf={!this.props.project.id}
            onClick={this.handleDownload}
          >
            {this.props.t('Nav.File.Download')}
          </NavMenuItem>
          <NavMenuItem
            hideIf={!this.props.user.authenticated}
            href={`/${this.props.user.username}/sketches`}
          >
            {this.props.t('Nav.File.Open')}
          </NavMenuItem>
          <NavMenuItem
            hideIf={
              !getConfig('UI_COLLECTIONS_ENABLED') ||
              !this.props.user.authenticated ||
              !this.props.project.id
            }
            href={`/${this.props.user.username}/sketches/${this.props.project.id}/add-to-collection`}
          >
            {this.props.t('Nav.File.AddToCollection')}
          </NavMenuItem>
          <NavMenuItem
            hideIf={!getConfig('EXAMPLES_ENABLED')}
            href="/p5/sketches"
          >
            {this.props.t('Nav.File.Examples')}
          </NavMenuItem>
        </NavDropdownMenu>
        <NavDropdownMenu id="edit" title={this.props.t('Nav.Edit.Title')}>
          <NavMenuItem onClick={this.props.cmController.tidyCode}>
            {this.props.t('Nav.Edit.TidyCode')}
            <span className="nav__keyboard-shortcut">
              {metaKeyName}+{'\u21E7'}+F
            </span>
          </NavMenuItem>
          <NavMenuItem onClick={this.props.cmController.showFind}>
            {this.props.t('Nav.Edit.Find')}
            <span className="nav__keyboard-shortcut">{metaKeyName}+F</span>
          </NavMenuItem>
          <NavMenuItem onClick={this.props.cmController.showReplace}>
            {this.props.t('Nav.Edit.Replace')}
            <span className="nav__keyboard-shortcut">{replaceCommand}</span>
          </NavMenuItem>
        </NavDropdownMenu>
        <NavDropdownMenu id="sketch" title={this.props.t('Nav.Sketch.Title')}>
          <NavMenuItem
            onClick={() => this.props.newFile(this.props.rootFile.id)}
          >
            {this.props.t('Nav.Sketch.AddFile')}
          </NavMenuItem>
          <NavMenuItem
            onClick={() => this.props.newFolder(this.props.rootFile.id)}
          >
            {this.props.t('Nav.Sketch.AddFolder')}
          </NavMenuItem>
          <NavMenuItem onClick={this.props.startSketch}>
            {this.props.t('Nav.Sketch.Run')}
            <span className="nav__keyboard-shortcut">{metaKeyName}+Enter</span>
          </NavMenuItem>
          <NavMenuItem onClick={this.props.stopSketch}>
            {this.props.t('Nav.Sketch.Stop')}
            <span className="nav__keyboard-shortcut">
              {'\u21E7'}+{metaKeyName}+Enter
            </span>
          </NavMenuItem>
        </NavDropdownMenu>
        <NavDropdownMenu id="help" title={this.props.t('Nav.Help.Title')}>
          <NavMenuItem onClick={this.props.showKeyboardShortcutModal}>
            {this.props.t('Nav.Help.KeyboardShortcuts')}
          </NavMenuItem>
          <NavMenuItem href="https://p5js.org/reference/">
            {this.props.t('Nav.Help.Reference')}
          </NavMenuItem>
          <NavMenuItem href="/about">
            {this.props.t('Nav.Help.About')}
          </NavMenuItem>
        </NavDropdownMenu>
      </ul>
    );
  }

  renderLanguageMenu() {
    return (
      <NavDropdownMenu
        id="lang"
        title={languageKeyToLabel(this.props.language)}
      >
        {sortBy(availableLanguages).map((key) => (
          <NavMenuItem key={key} value={key} onClick={this.handleLangSelection}>
            {languageKeyToLabel(key)}
          </NavMenuItem>
        ))}
      </NavDropdownMenu>
    );
  }

  renderUnauthenticatedUserMenu() {
    return (
      <ul className="nav__items-right" title="user-menu">
        {getConfig('TRANSLATIONS_ENABLED') && this.renderLanguageMenu()}
        <li className="nav__item">
          <Link to="/login" className="nav__auth-button">
            <span className="nav__item-header" title="Login">
              {this.props.t('Nav.Login')}
            </span>
          </Link>
        </li>
        <span className="nav__item-or">{this.props.t('Nav.LoginOr')}</span>
        <li className="nav__item">
          <Link to="/signup" className="nav__auth-button">
            <span className="nav__item-header" title="SignUp">
              {this.props.t('Nav.SignUp')}
            </span>
          </Link>
        </li>
      </ul>
    );
  }

  renderAuthenticatedUserMenu() {
    return (
      <ul className="nav__items-right" title="user-menu">
        {getConfig('TRANSLATIONS_ENABLED') && this.renderLanguageMenu()}
        <NavDropdownMenu
          id="account"
          title={
            <span>
              {this.props.t('Nav.Auth.Hello')}, {this.props.user.username}!
            </span>
          }
        >
          <NavMenuItem href={`/${this.props.user.username}/sketches`}>
            {this.props.t('Nav.Auth.MySketches')}
          </NavMenuItem>
          <NavMenuItem
            href={`/${this.props.user.username}/collections`}
            hideIf={!getConfig('UI_COLLECTIONS_ENABLED')}
          >
            {this.props.t('Nav.Auth.MyCollections')}
          </NavMenuItem>
          <NavMenuItem href={`/${this.props.user.username}/assets`}>
            {this.props.t('Nav.Auth.MyAssets')}
          </NavMenuItem>
          <NavMenuItem href="/account">
            {this.props.t('Preferences.Settings')}
          </NavMenuItem>
          <NavMenuItem onClick={this.props.logoutUser}>
            {this.props.t('Nav.Auth.LogOut')}
          </NavMenuItem>
        </NavDropdownMenu>
      </ul>
    );
  }

  renderUserMenu() {
    const isLoginEnabled = getConfig('LOGIN_ENABLED');
    const isAuthenticated = this.props.user.authenticated;

    if (isLoginEnabled && isAuthenticated) {
      return this.renderAuthenticatedUserMenu();
    } else if (isLoginEnabled && !isAuthenticated) {
      return this.renderUnauthenticatedUserMenu();
    }

    return null;
  }

  renderLeftLayout() {
    switch (this.props.layout) {
      case 'dashboard':
        return this.renderDashboardMenu();
      case 'project':
      default:
        return this.renderProjectMenu();
    }
  }

  render() {
    return (
      <NavBar>
        {this.renderLeftLayout()}
        {this.renderUserMenu()}
      </NavBar>
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
    showReplace: PropTypes.func,
    getContent: PropTypes.func
  }),
  startSketch: PropTypes.func.isRequired,
  stopSketch: PropTypes.func.isRequired,
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
  isUserOwner: PropTypes.bool.isRequired,
  editorLink: PropTypes.string
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
  },
  editorLink: '/'
};

function mapStateToProps(state) {
  return {
    project: state.project,
    user: state.user,
    unsavedChanges: state.ide.unsavedChanges,
    rootFile: state.files.filter((file) => file.name === 'root')[0],
    language: state.preferences.language,
    isUserOwner: getIsUserOwner(state),
    editorLink: selectSketchPath(state)
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

export default withTranslation()(
  withRouter(connect(mapStateToProps, mapDispatchToProps)(Nav))
);
export { Nav as NavComponent };
