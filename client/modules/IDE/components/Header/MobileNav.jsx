import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { prop, remSize } from '../../../../theme';
import AsteriskIcon from '../../../../images/p5-asterisk.svg';
import IconButton from '../../../../components/mobile/IconButton';
import { AccountIcon, EditorIcon, MoreIcon } from '../../../../common/icons';
import {
  newFile,
  newFolder,
  openPreferences,
  showKeyboardShortcutModal
} from '../../actions/ide';
import { logoutUser } from '../../../User/actions';
import { useSketchActions } from '../../hooks';
import { CmControllerContext } from '../../pages/IDEView';
import { selectSketchPath } from '../../selectors/project';

const Nav = styled.div`
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

  > * {
    padding: 0;
    margin: 0;
  }

  > h5 {
    font-size: ${remSize(13)};
    font-weight: normal;
  }
`;

const Options = styled.div`
  margin-left: auto;
  display: flex;
  /* transform: translateX(${remSize(12)}); */
  svg {
    fill: ${(props) => props.color};
  }

  /* Drop Down menu */
  > div > button:focus + ul,
  > div > ul > button:focus ~ div > ul {
    transform: scale(1);
    opacity: 1;
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
        a {
          width: 100%;
        }
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

const MobileNav = (props) => {
  const project = useSelector((state) => state.project);
  const user = useSelector((state) => state.user);

  const { pathname } = useLocation();
  const editorLink = useSelector(selectSketchPath);

  // TODO: remove the switch and use a props like mobileTitle <Nav layout=“dashboard” mobileTitle={t(‘Login’)} />
  function resolveTitle() {
    switch (pathname) {
      case '/':
        return project.name;
      case '/login':
        return 'Login';
      case '/signup':
        return 'Signup';
      case '/account':
        return 'Account Settings';
      case '/p5/sketches':
      case '/p5/collections':
        return 'Examples';
      case `/${user.username}/assets`:
      case `/${user.username}/collections`:
      case `/${user.username}/sketches`:
        return 'My Stuff';
      default:
        return project.name;
    }
  }

  const title = useMemo(resolveTitle, [project, pathname]);

  const Logo = AsteriskIcon;
  return (
    <Nav>
      <LogoContainer>
        <Logo />
      </LogoContainer>
      <Title>
        <h1>{title}</h1>
        {project?.owner && title === project.name && (
          <h5>by {project?.owner?.username}</h5>
        )}
      </Title>
      <Options>
        {user.authenticated ? (
          <AccountMenu />
        ) : (
          <div>
            <Link to="/login">
              <IconButton icon={AccountIcon} />
            </Link>
          </div>
        )}
        {title === project.name ? (
          <MoreMenu />
        ) : (
          <div>
            <Link to={editorLink}>
              <IconButton icon={EditorIcon} />
            </Link>
          </div>
        )}
      </Options>
    </Nav>
  );
};

const AccountMenu = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  return (
    <div>
      <IconButton icon={AccountIcon} />
      <ul>
        <li className="user">{user.username}</li>
        <li>
          <Link to={`/${user.username}/sketches`}>
            <button>My Stuff</button>
          </Link>
        </li>
        <li>
          <Link to="/account">
            <button>Settings</button>
          </Link>
        </li>
        <li>
          <button onClick={() => dispatch(logoutUser())}>Log Out</button>
        </li>
      </ul>
    </div>
  );
};

const MoreMenu = () => {
  // TODO: use selectRootFile selector
  const rootFile = useSelector(
    (state) => state.files.filter((file) => file.name === 'root')[0]
  );
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { newSketch, saveSketch } = useSketchActions();

  const cmRef = useContext(CmControllerContext);

  return (
    <div>
      <IconButton icon={MoreIcon} />
      <ul>
        <b>{t('Nav.File.Title')}</b>
        <li>
          <button onClick={newSketch}>{t('Nav.File.New')}</button>
        </li>
        <li>
          <button onClick={() => saveSketch(cmRef.current)}>
            {t('Common.Save')}
          </button>
        </li>
        <li>
          <Link to="/p5/sketches">
            <button>{t('Nav.File.Examples')}</button>
          </Link>
        </li>
        <b>{t('Nav.Edit.Title')}</b>
        <li>
          <button onClick={cmRef.current?.tidyCode}>
            {t('Nav.Edit.TidyCode')}
          </button>
        </li>
        <li>
          <button onClick={cmRef.current?.showFind}>
            {t('Nav.Edit.Find')}
          </button>
        </li>
        <b>{t('Nav.Sketch.Title')}</b>
        <li>
          <button onClick={() => dispatch(newFile(rootFile.id))}>
            {t('Nav.Sketch.AddFile')}
          </button>
        </li>
        <li>
          <button onClick={() => dispatch(newFolder(rootFile.id))}>
            {t('Nav.Sketch.AddFolder')}
          </button>
        </li>
        {/* TODO: Add Translations */}
        <b>Settings</b>
        <li>
          <button
            onClick={() => {
              dispatch(openPreferences());
            }}
          >
            Preferences
          </button>
        </li>
        <li>
          <button>Language</button>
        </li>
        <b>{t('Nav.Help.Title')}</b>
        <li>
          <button onClick={() => dispatch(showKeyboardShortcutModal())}>
            {t('Nav.Help.KeyboardShortcuts')}
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              window.location = 'https://p5js.org/reference/';
            }}
          >
            {t('Nav.Help.Reference')}
          </button>
        </li>
        <li>
          <Link to="/about">
            <button>{t('Nav.Help.About')}</button>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default MobileNav;
