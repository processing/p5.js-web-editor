import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sortBy } from 'lodash';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import MediaQuery from 'react-responsive';
import NavDropdownMenu from '../../../../components/Nav/NavDropdownMenu';
import NavMenuItem from '../../../../components/Nav/NavMenuItem';
import { availableLanguages, languageKeyToLabel } from '../../../../i18n';
import getConfig from '../../../../utils/getConfig';
import { showToast } from '../../actions/toast';
import { setLanguage } from '../../actions/preferences';
import NavBar from '../../../../components/Nav/NavBar';
import CaretLeftIcon from '../../../../images/left-arrow.svg';
import LogoIcon from '../../../../images/p5js-logo-small.svg';
import { selectRootFile } from '../../selectors/files';
import { selectSketchPath } from '../../selectors/project';
import { metaKey, metaKeyName } from '../../../../utils/metaKey';
import { useSketchActions } from '../../hooks';
import { getAuthenticated, getIsUserOwner } from '../../selectors/users';
import { cloneProject } from '../../actions/project';
import {
  newFile,
  newFolder,
  showKeyboardShortcutModal,
  startSketch,
  stopSketch
} from '../../actions/ide';
import { logoutUser } from '../../../User/actions';
import { CmControllerContext } from '../../pages/IDEView';
import MobileNav from './MobileNav';

const Nav = ({ layout }) => (
  <MediaQuery minWidth={770}>
    {(matches) =>
      matches ? (
        <NavBar>
          <LeftLayout layout={layout} />
          <UserMenu />
        </NavBar>
      ) : (
        <MobileNav />
      )
    }
  </MediaQuery>
);

Nav.propTypes = {
  layout: PropTypes.oneOf(['dashboard', 'project'])
};

Nav.defaultProps = {
  layout: 'project'
};

const LeftLayout = (props) => {
  switch (props.layout) {
    case 'dashboard':
      return <DashboardMenu />;
    case 'project':
    default:
      return <ProjectMenu />;
  }
};

LeftLayout.propTypes = {
  layout: PropTypes.oneOf(['dashboard', 'project'])
};

LeftLayout.defaultProps = {
  layout: 'project'
};

const UserMenu = () => {
  const isLoginEnabled = getConfig('LOGIN_ENABLED');
  const isAuthenticated = useSelector(getAuthenticated);

  if (isLoginEnabled && isAuthenticated) {
    return <AuthenticatedUserMenu />;
  } else if (isLoginEnabled && !isAuthenticated) {
    return <UnauthenticatedUserMenu />;
  }

  return null;
};

const DashboardMenu = () => {
  const { t } = useTranslation();
  const editorLink = useSelector(selectSketchPath);
  return (
    <ul className="nav__items-left">
      <li className="nav__item-logo">
        <LogoIcon
          role="img"
          aria-label={t('Common.p5logoARIA')}
          focusable="false"
          className="svg__logo"
        />
      </li>
      <li className="nav__item nav__item--no-icon">
        <Link to={editorLink} className="nav__back-link">
          <CaretLeftIcon
            className="nav__back-icon"
            focusable="false"
            aria-hidden="true"
          />
          <span className="nav__item-header">{t('Nav.BackEditor')}</span>
        </Link>
      </li>
    </ul>
  );
};

const ProjectMenu = () => {
  const isUserOwner = useSelector(getIsUserOwner);
  const project = useSelector((state) => state.project);
  const user = useSelector((state) => state.user);

  const isUnsaved = !project?.id;

  const rootFile = useSelector(selectRootFile);

  const cmRef = useContext(CmControllerContext);

  const dispatch = useDispatch();

  const { t } = useTranslation();
  const {
    newSketch,
    saveSketch,
    downloadSketch,
    shareSketch
  } = useSketchActions();

  const replaceCommand =
    metaKey === 'Ctrl' ? `${metaKeyName}+H` : `${metaKeyName}+⌥+F`;

  return (
    <ul className="nav__items-left">
      <li className="nav__item-logo">
        <LogoIcon
          role="img"
          aria-label={t('Common.p5logoARIA')}
          focusable="false"
          className="svg__logo"
        />
      </li>
      <NavDropdownMenu id="file" title={t('Nav.File.Title')}>
        <NavMenuItem onClick={newSketch}>{t('Nav.File.New')}</NavMenuItem>
        <NavMenuItem
          hideIf={
            !getConfig('LOGIN_ENABLED') || (project?.owner && !isUserOwner)
          }
          onClick={() => saveSketch(cmRef.current)}
        >
          {t('Common.Save')}
          <span className="nav__keyboard-shortcut">{metaKeyName}+S</span>
        </NavMenuItem>
        <NavMenuItem
          hideIf={isUnsaved || !user.authenticated}
          onClick={() => dispatch(cloneProject())}
        >
          {t('Nav.File.Duplicate')}
        </NavMenuItem>
        <NavMenuItem hideIf={isUnsaved} onClick={shareSketch}>
          {t('Nav.File.Share')}
        </NavMenuItem>
        <NavMenuItem hideIf={isUnsaved} onClick={downloadSketch}>
          {t('Nav.File.Download')}
        </NavMenuItem>
        <NavMenuItem
          hideIf={!user.authenticated}
          href={`/${user.username}/sketches`}
        >
          {t('Nav.File.Open')}
        </NavMenuItem>
        <NavMenuItem
          hideIf={
            !getConfig('UI_COLLECTIONS_ENABLED') ||
            !user.authenticated ||
            isUnsaved
          }
          href={`/${user.username}/sketches/${project?.id}/add-to-collection`}
        >
          {t('Nav.File.AddToCollection')}
        </NavMenuItem>
        <NavMenuItem
          hideIf={!getConfig('EXAMPLES_ENABLED')}
          href="/p5/sketches"
        >
          {t('Nav.File.Examples')}
        </NavMenuItem>
      </NavDropdownMenu>
      <NavDropdownMenu id="edit" title={t('Nav.Edit.Title')}>
        <NavMenuItem onClick={cmRef.current?.tidyCode}>
          {t('Nav.Edit.TidyCode')}
          <span className="nav__keyboard-shortcut">
            {metaKeyName}+{'\u21E7'}+F
          </span>
        </NavMenuItem>
        <NavMenuItem onClick={cmRef.current?.showFind}>
          {t('Nav.Edit.Find')}
          <span className="nav__keyboard-shortcut">{metaKeyName}+F</span>
        </NavMenuItem>
        <NavMenuItem onClick={cmRef.current?.showReplace}>
          {t('Nav.Edit.Replace')}
          <span className="nav__keyboard-shortcut">{replaceCommand}</span>
        </NavMenuItem>
      </NavDropdownMenu>
      <NavDropdownMenu id="sketch" title={t('Nav.Sketch.Title')}>
        <NavMenuItem onClick={() => dispatch(newFile(rootFile.id))}>
          {t('Nav.Sketch.AddFile')}
        </NavMenuItem>
        <NavMenuItem onClick={() => dispatch(newFolder(rootFile.id))}>
          {t('Nav.Sketch.AddFolder')}
        </NavMenuItem>
        <NavMenuItem onClick={() => dispatch(startSketch())}>
          {t('Nav.Sketch.Run')}
          <span className="nav__keyboard-shortcut">{metaKeyName}+Enter</span>
        </NavMenuItem>
        <NavMenuItem onClick={() => dispatch(stopSketch())}>
          {t('Nav.Sketch.Stop')}
          <span className="nav__keyboard-shortcut">
            {'\u21E7'}+{metaKeyName}+Enter
          </span>
        </NavMenuItem>
      </NavDropdownMenu>
      <NavDropdownMenu id="help" title={t('Nav.Help.Title')}>
        <NavMenuItem onClick={() => dispatch(showKeyboardShortcutModal())}>
          {t('Nav.Help.KeyboardShortcuts')}
        </NavMenuItem>
        <NavMenuItem href="https://p5js.org/reference/">
          {t('Nav.Help.Reference')}
        </NavMenuItem>
        <NavMenuItem href="/about">{t('Nav.Help.About')}</NavMenuItem>
      </NavDropdownMenu>
    </ul>
  );
};

const LanguageMenu = () => {
  const language = useSelector((state) => state.preferences.language);
  const dispatch = useDispatch();

  function handleLangSelection(event) {
    dispatch(setLanguage(event.target.value));
    dispatch(showToast('Toast.LangChange'));
  }

  return (
    <NavDropdownMenu id="lang" title={languageKeyToLabel(language)}>
      {sortBy(availableLanguages).map((key) => (
        // eslint-disable-next-line react/jsx-no-bind
        <NavMenuItem key={key} value={key} onClick={handleLangSelection}>
          {languageKeyToLabel(key)}
        </NavMenuItem>
      ))}
    </NavDropdownMenu>
  );
};

const UnauthenticatedUserMenu = () => {
  const { t } = useTranslation();
  return (
    <ul className="nav__items-right" title="user-menu">
      {getConfig('TRANSLATIONS_ENABLED') && <LanguageMenu />}
      <li className="nav__item">
        <Link to="/login" className="nav__auth-button">
          <span className="nav__item-header" title="Login">
            {t('Nav.Login')}
          </span>
        </Link>
      </li>
      <span className="nav__item-or">{t('Nav.LoginOr')}</span>
      <li className="nav__item">
        <Link to="/signup" className="nav__auth-button">
          <span className="nav__item-header" title="SignUp">
            {t('Nav.SignUp')}
          </span>
        </Link>
      </li>
    </ul>
  );
};

const AuthenticatedUserMenu = () => {
  const username = useSelector((state) => state.user.username);

  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <ul className="nav__items-right" title="user-menu">
      {getConfig('TRANSLATIONS_ENABLED') && <LanguageMenu />}
      <NavDropdownMenu
        id="account"
        title={
          <span>
            {t('Nav.Auth.Hello')}, {username}!
          </span>
        }
      >
        <NavMenuItem href={`/${username}/sketches`}>
          {t('Nav.Auth.MySketches')}
        </NavMenuItem>
        <NavMenuItem
          href={`/${username}/collections`}
          hideIf={!getConfig('UI_COLLECTIONS_ENABLED')}
        >
          {t('Nav.Auth.MyCollections')}
        </NavMenuItem>
        <NavMenuItem href={`/${username}/assets`}>
          {t('Nav.Auth.MyAssets')}
        </NavMenuItem>
        <NavMenuItem href="/account">{t('Preferences.Settings')}</NavMenuItem>
        <NavMenuItem onClick={() => dispatch(logoutUser())}>
          {t('Nav.Auth.LogOut')}
        </NavMenuItem>
      </NavDropdownMenu>
    </ul>
  );
};

export default Nav;
