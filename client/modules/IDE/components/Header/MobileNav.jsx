import React, { useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import { ParentMenuContext } from '../../../../components/Menubar/contexts';
import Menubar from '../../../../components/Menubar/Menubar';
import { useMenuProps } from '../../../../components/Menubar/MenubarSubmenu';
import NavMenuItem from '../../../../components/Menubar/MenubarItem';
import { prop, remSize } from '../../../../theme';
import AsteriskIcon from '../../../../images/p5-asterisk.svg';
import IconButton from '../../../../common/IconButton';
import {
  AccountIcon,
  AddIcon,
  EditorIcon,
  MoreIcon,
  CrossIcon
} from '../../../../common/icons';
import {
  newFile,
  newFolder,
  openPreferences,
  showKeyboardShortcutModal
} from '../../actions/ide';
import { logoutUser } from '../../../User/actions';
import { useSketchActions, useWhatPage } from '../../hooks';
import { CmControllerContext } from '../../pages/IDEView';
import { selectSketchPath } from '../../selectors/project';
import { availableLanguages, languageKeyToLabel } from '../../../../i18n';
import { showToast } from '../../actions/toast';
import { setLanguage } from '../../actions/preferences';
import Overlay from '../../../App/components/Overlay';
import ProjectName from './ProjectName';
import CollectionCreate from '../../../User/components/CollectionCreate';

const Nav = styled(Menubar)`
  background: ${prop('MobilePanel.default.background')};
  color: ${prop('primaryTextColor')};
  padding: ${remSize(8)} 0;
  gap: ${remSize(14)};
  display: flex;
  align-items: center;
  font-size: ${remSize(10)};
  box-shadow: #00000030 0px 2px 8px 0px;
  z-index: 10;
`;

const LogoContainer = styled.div`
  width: ${remSize(28)};
  aspect-ratio: 1;
  margin-left: ${remSize(14)};
  display: flex;
  justify-content: center;
  align-items: center;
  > svg {
    width: 100%;
    height: 100%;
    > path {
      fill: ${prop('accentColor')};
      stroke: ${prop('accentColor')};
    }
  }
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${remSize(2)};

  * {
    padding: 0;
    margin: 0;
  }

  > h5 {
    font-size: ${remSize(13)};
    font-weight: normal;
  }
`;

export const Options = styled.div`
  margin-left: auto;
  display: flex;
  /* transform: translateX(${remSize(12)}); */
  svg {
    fill: ${(props) => props.color};
  }

  /* Drop Down menu */
  ul.opened {
    transform: scale(1);
    opacity: 1;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  > div {
    position: relative;
    ul {
      ${prop('MobilePanel.default')}
      position: absolute;
      overflow: hidden;
      z-index: 10;
      right: 10px;
      transform: translateX(${remSize(6)});
      width: max-content;
      transform: scale(0);
      opacity: 0;
      transform-origin: top;
      transition: opacity 100ms, transform 100ms 200ms;
      display: flex;
      flex-direction: column;
      gap: ${remSize(2)};
      box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
        rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
      min-width: ${remSize(120)};
      border-radius: ${remSize(2)};

      /* User */
      li.user {
        color: ${prop('colors.processingBlue')};
        font-size: ${remSize(16)};
        font-weight: bold;
        margin: ${remSize(6)} ${remSize(12)};
      }

      > b {
        margin: ${remSize(6)} ${remSize(12)};
        position: relative;
        width: min-content;
        &::after {
          content: '';
          position: absolute;
          opacity: calc(0.5);
          top: 50%;
          transform: translate(100%, -50%);
          right: ${remSize(-6)};
          width: ${remSize(55)};
          height: 1px;
          background-color: ${prop('Button.primary.default.foreground')};
        }
      }

      > li {
        display: flex;
        width: 100%;
        a,
        button {
          width: 100%;
          padding: ${remSize(8)} ${remSize(15)} ${remSize(8)} ${remSize(10)};
          font-size: ${remSize(18)};
          text-align: left;
          &:hover {
            background-color: ${prop('Button.primary.hover.background')};
            color: ${prop('Button.primary.hover.foreground')};
          }
        }
      }
    }
  }
`;

const LanguageSelect = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow-y: auto;

  h3 {
    text-align: center;
    margin-bottom: 2rem;
  }

  div {
    display: flex;
    gap: ${remSize(8)};
    flex-direction: column;
    align-items: center;
    margin: auto 0;

    button {
      font-size: ${remSize(16)};
      padding: ${remSize(8)} ${remSize(15)} ${remSize(8)} ${remSize(10)};
      width: 100%;
      max-width: 80vw;

      &:hover,
      &:active,
      &.current-language,
      &:focus {
        background-color: ${prop('Button.primary.hover.background')};
        color: ${prop('Button.primary.hover.foreground')};
      }
    }
  }
`;

const MobileNav = () => {
  const project = useSelector((state) => state.project);
  const user = useSelector((state) => state.user);

  const { t } = useTranslation();

  const editorLink = useSelector(selectSketchPath);
  const pageName = useWhatPage();

  // TODO: remove the switch and use a props like mobileTitle <Nav layout=“dashboard” mobileTitle={t(‘Login’)} />
  function resolveTitle() {
    switch (pageName) {
      case 'login':
        return t('LoginView.Login');
      case 'signup':
        return t('LoginView.SignUp');
      case 'account':
        return t('AccountView.Settings');
      case 'examples':
        return t('Nav.File.Examples');
      case 'myStuff':
        return 'My Stuff';
      default:
        return project.name;
    }
  }

  const title = useMemo(resolveTitle, [pageName, project.name]);

  const Logo = AsteriskIcon;
  return (
    <Nav>
      <LogoContainer>
        <Logo />
      </LogoContainer>
      <Title>
        <h1>{title === project.name ? <ProjectName /> : title}</h1>
        {project?.owner && title === project.name && (
          <Link to={`/${project.owner.username}/sketches`}>
            by {project?.owner?.username}
          </Link>
        )}
      </Title>
      {/* check if the user is in login page */}
      {pageName === 'login' || pageName === 'signup' ? (
        // showing the CrossIcon
        <Options>
          <div>
            <Link to={editorLink}>
              <IconButton icon={CrossIcon} />
            </Link>
          </div>
        </Options>
      ) : (
        // Menus for other pages
        <Options>
          {pageName === 'myStuff' && <StuffMenu />}
          {user.authenticated ? (
            <AccountMenu />
          ) : (
            <div>
              <Link to="/login">
                <IconButton icon={AccountIcon} />
              </Link>
            </div>
          )}
          {pageName === 'home' ? (
            <MoreMenu />
          ) : (
            <div>
              <Link to={editorLink}>
                <IconButton icon={EditorIcon} />
              </Link>
            </div>
          )}
        </Options>
      )}
    </Nav>
  );
};

const StuffMenu = () => {
  const { isOpen, handlers } = useMenuProps('stuff');
  const { newSketch } = useSketchActions();

  const [createCollectionVisible, setCreateCollectionVisible] = useState(false);

  const { t } = useTranslation();

  return (
    <div>
      <IconButton icon={AddIcon} {...handlers} />
      <ul className={isOpen ? 'opened' : ''}>
        <ParentMenuContext.Provider value="stuff">
          <NavMenuItem onClick={() => newSketch()}>
            {t('DashboardView.NewSketch')}
          </NavMenuItem>
          <NavMenuItem onClick={() => setCreateCollectionVisible(true)}>
            {t('DashboardView.CreateCollection')}
          </NavMenuItem>
        </ParentMenuContext.Provider>
      </ul>
      {createCollectionVisible && (
        <Overlay
          title={t('DashboardView.CreateCollectionOverlay')}
          closeOverlay={() => setCreateCollectionVisible(false)}
        >
          <CollectionCreate />
        </Overlay>
      )}
    </div>
  );
};

const AccountMenu = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const { isOpen, handlers } = useMenuProps('account');

  return (
    <div>
      <IconButton icon={AccountIcon} {...handlers} />
      <ul className={isOpen ? 'opened' : ''}>
        <ParentMenuContext.Provider value="account">
          <li className="user">{user.username}</li>
          <NavMenuItem href={`/${user.username}/sketches`}>
            My Stuff
          </NavMenuItem>
          <NavMenuItem href="/account">Settings</NavMenuItem>
          <NavMenuItem onClick={() => dispatch(logoutUser())}>
            Log Out
          </NavMenuItem>
        </ParentMenuContext.Provider>
      </ul>
    </div>
  );
};

const MoreMenu = () => {
  // TODO: use selectRootFile selector
  const rootFile = useSelector(
    (state) => state.files.filter((file) => file.name === 'root')[0]
  );
  const language = useSelector((state) => state.preferences.language);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { newSketch, saveSketch } = useSketchActions();

  const cmRef = useContext(CmControllerContext);

  const { isOpen, handlers } = useMenuProps('more');

  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  function handleLangSelection(event) {
    dispatch(setLanguage(event.target.value));
    dispatch(showToast('Toast.LangChange'));
    setIsLanguageModalVisible(false);
  }

  return (
    <div>
      {isLanguageModalVisible && (
        <Overlay
          // TODO: add translations
          title="Select Language"
          ariaLabel="Select Language"
          closeOverlay={() => setIsLanguageModalVisible(false)}
        >
          <LanguageSelect>
            <div>
              {sortBy(availableLanguages).map((key) => {
                const label = languageKeyToLabel(key);
                return (
                  <button
                    className={classNames({
                      'current-language': label === languageKeyToLabel(language)
                    })}
                    aria-label={label}
                    key={key}
                    onClick={handleLangSelection}
                    value={key}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </LanguageSelect>
        </Overlay>
      )}
      <IconButton icon={MoreIcon} {...handlers} />
      <ul className={isOpen ? 'opened' : ''}>
        <ParentMenuContext.Provider value="more">
          <b>{t('Nav.File.Title')}</b>
          <NavMenuItem onClick={newSketch}>{t('Nav.File.New')}</NavMenuItem>

          <NavMenuItem onClick={() => saveSketch(cmRef.current)}>
            {t('Common.Save')}
          </NavMenuItem>
          <NavMenuItem href="/p5/sketches">
            {t('Nav.File.Examples')}
          </NavMenuItem>
          <b>{t('Nav.Edit.Title')}</b>
          <NavMenuItem onClick={cmRef.current?.tidyCode}>
            {t('Nav.Edit.TidyCode')}
          </NavMenuItem>
          <NavMenuItem onClick={cmRef.current?.showFind}>
            {t('Nav.Edit.Find')}
          </NavMenuItem>
          <b>{t('Nav.Sketch.Title')}</b>
          <NavMenuItem onClick={() => dispatch(newFile(rootFile.id))}>
            {t('Nav.Sketch.AddFile')}
          </NavMenuItem>
          <NavMenuItem onClick={() => dispatch(newFolder(rootFile.id))}>
            {t('Nav.Sketch.AddFolder')}
          </NavMenuItem>
          {/* TODO: Add Translations */}
          <b>Settings</b>
          <NavMenuItem
            onClick={() => {
              dispatch(openPreferences());
            }}
          >
            Preferences
          </NavMenuItem>
          <NavMenuItem onClick={() => setIsLanguageModalVisible(true)}>
            Language
          </NavMenuItem>
          <b>{t('Nav.Help.Title')}</b>
          <NavMenuItem onClick={() => dispatch(showKeyboardShortcutModal())}>
            {t('Nav.Help.KeyboardShortcuts')}
          </NavMenuItem>
          <NavMenuItem href="https://p5js.org/reference/">
            {t('Nav.Help.Reference')}
          </NavMenuItem>
          <NavMenuItem href="/about">{t('Nav.Help.About')}</NavMenuItem>
        </ParentMenuContext.Provider>
      </ul>
    </div>
  );
};

export default MobileNav;
