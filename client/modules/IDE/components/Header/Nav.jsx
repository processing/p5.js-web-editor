import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sortBy } from 'lodash';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import MenubarSubmenu from '../../../../components/Menubar/MenubarSubmenu';
import MenubarItem from '../../../../components/Menubar/MenubarItem';
import { availableLanguages, languageKeyToLabel } from '../../../../i18n';
import getConfig from '../../../../utils/getConfig';
import { showToast } from '../../actions/toast';
import { setLanguage } from '../../actions/preferences';
import Menubar from '../../../../components/Menubar/Menubar';
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
import useIsMobile from '../../hooks/useIsMobile';

const Nav = ({ layout }) => {
  const isMobile = useIsMobile();

  return isMobile ? (
    <MobileNav />
  ) : (
    <>
      <header className="nav__header">
        <Menubar>
          <LeftLayout layout={layout} />
          <UserMenu />
        </Menubar>
      </header>
    </>
  );
};

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
  const userSketches = `/${user.username}/sketches`;
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
  const newFileCommand =
    metaKey === 'Ctrl' ? `${metaKeyName}+Alt+N` : `${metaKeyName}+⌥+N`;

  return (
    <ul className="nav__items-left" role="menubar">
      <li className="nav__item-logo">
        {user && user.username !== undefined ? (
          <Link to={userSketches}>
            <LogoIcon
              role="img"
              aria-label={t('Common.p5logoARIA')}
              focusable="false"
              className="svg__logo"
            />
          </Link>
        ) : (
          <a href="https://p5js.org">
            <LogoIcon
              role="img"
              aria-label={t('Common.p5logoARIA')}
              focusable="false"
              className="svg__logo"
            />
          </a>
        )}
      </li>
      <MenubarSubmenu id="file" title={t('Nav.File.Title')}>
        <MenubarItem onClick={newSketch}>{t('Nav.File.New')}</MenubarItem>
        <MenubarItem
          hideIf={
            !getConfig('LOGIN_ENABLED') || (project?.owner && !isUserOwner)
          }
          onClick={() => saveSketch(cmRef.current)}
        >
          {t('Common.Save')}
          <span className="nav__keyboard-shortcut">{metaKeyName}+S</span>
        </MenubarItem>
        <MenubarItem
          hideIf={isUnsaved || !user.authenticated}
          onClick={() => dispatch(cloneProject())}
        >
          {t('Nav.File.Duplicate')}
        </MenubarItem>
        <MenubarItem hideIf={isUnsaved} onClick={shareSketch}>
          {t('Nav.File.Share')}
        </MenubarItem>
        <MenubarItem hideIf={isUnsaved} onClick={downloadSketch}>
          {t('Nav.File.Download')}
        </MenubarItem>
        <MenubarItem
          hideIf={!user.authenticated}
          href={`/${user.username}/sketches`}
        >
          {t('Nav.File.Open')}
        </MenubarItem>
        <MenubarItem
          hideIf={
            !getConfig('UI_COLLECTIONS_ENABLED') ||
            !user.authenticated ||
            isUnsaved
          }
          href={`/${user.username}/sketches/${project?.id}/add-to-collection`}
        >
          {t('Nav.File.AddToCollection')}
        </MenubarItem>
        <MenubarItem
          hideIf={!getConfig('EXAMPLES_ENABLED')}
          href="/p5/sketches"
        >
          {t('Nav.File.Examples')}
        </MenubarItem>
      </MenubarSubmenu>
      <MenubarSubmenu id="edit" title={t('Nav.Edit.Title')}>
        <MenubarItem onClick={cmRef.current?.tidyCode}>
          {t('Nav.Edit.TidyCode')}
          <span className="nav__keyboard-shortcut">{metaKeyName}+Shift+F</span>
        </MenubarItem>
        <MenubarItem onClick={cmRef.current?.showFind}>
          {t('Nav.Edit.Find')}
          <span className="nav__keyboard-shortcut">{metaKeyName}+F</span>
        </MenubarItem>
        <MenubarItem onClick={cmRef.current?.showReplace}>
          {t('Nav.Edit.Replace')}
          <span className="nav__keyboard-shortcut">{replaceCommand}</span>
        </MenubarItem>
      </MenubarSubmenu>
      <MenubarSubmenu id="sketch" title={t('Nav.Sketch.Title')}>
        <MenubarItem onClick={() => dispatch(newFile(rootFile.id))}>
          {t('Nav.Sketch.AddFile')}
          <span className="nav__keyboard-shortcut">{newFileCommand}</span>
        </MenubarItem>
        <MenubarItem onClick={() => dispatch(newFolder(rootFile.id))}>
          {t('Nav.Sketch.AddFolder')}
        </MenubarItem>
        <MenubarItem onClick={() => dispatch(startSketch())}>
          {t('Nav.Sketch.Run')}
          <span className="nav__keyboard-shortcut">{metaKeyName}+Enter</span>
        </MenubarItem>
        <MenubarItem onClick={() => dispatch(stopSketch())}>
          {t('Nav.Sketch.Stop')}
          <span className="nav__keyboard-shortcut">
            Shift+{metaKeyName}+Enter
          </span>
        </MenubarItem>
      </MenubarSubmenu>
      <MenubarSubmenu id="help" title={t('Nav.Help.Title')}>
        <MenubarItem onClick={() => dispatch(showKeyboardShortcutModal())}>
          {t('Nav.Help.KeyboardShortcuts')}
        </MenubarItem>
        <MenubarItem href="https://p5js.org/reference/">
          {t('Nav.Help.Reference')}
        </MenubarItem>
        <MenubarItem href="/about">{t('Nav.Help.About')}</MenubarItem>
      </MenubarSubmenu>
      {getConfig('TRANSLATIONS_ENABLED') && <LanguageMenu />}
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
    <MenubarSubmenu
      id="lang"
      title={languageKeyToLabel(language)}
      triggerRole="button"
      listRole="listbox"
    >
      {sortBy(availableLanguages).map((key) => (
        // eslint-disable-next-line react/jsx-no-bind
        <MenubarItem
          key={key}
          value={key}
          onClick={handleLangSelection}
          role="option"
          selected={key === language}
        >
          {languageKeyToLabel(key)}
        </MenubarItem>
      ))}
    </MenubarSubmenu>
  );
};

const UnauthenticatedUserMenu = () => {
  const { t } = useTranslation();
  return (
    <ul className="nav__items-right" title="user-menu">
      <li className="nav__item">
        <Link to="/login" className="nav__auth-button">
          <span className="nav__item-header" title="Login">
            {t('Nav.Login')}
          </span>
        </Link>
      </li>
      <li className="nav__item-or" role="presentation">
        {t('Nav.LoginOr')}
      </li>
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
      <MenubarSubmenu
        id="account"
        title={
          <span>
            {t('Nav.Auth.Hello')}, {username}!
          </span>
        }
      >
        <MenubarItem href={`/${username}/sketches`}>
          {t('Nav.Auth.MySketches')}
        </MenubarItem>
        <MenubarItem
          href={`/${username}/collections`}
          hideIf={!getConfig('UI_COLLECTIONS_ENABLED')}
        >
          {t('Nav.Auth.MyCollections')}
        </MenubarItem>
        <MenubarItem href={`/${username}/assets`}>
          {t('Nav.Auth.MyAssets')}
        </MenubarItem>
        <MenubarItem href="/account">{t('Preferences.Settings')}</MenubarItem>
        <MenubarItem onClick={() => dispatch(logoutUser())}>
          {t('Nav.Auth.LogOut')}
        </MenubarItem>
      </MenubarSubmenu>
    </ul>
  );
};

export default Nav;
