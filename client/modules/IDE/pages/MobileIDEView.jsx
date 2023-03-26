import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router';
import styled from 'styled-components';
import {
  FolderIcon,
  MoreIcon,
  PlayIcon,
  PreferencesIcon,
  SaveIcon,
  TerminalIcon
} from '../../../common/icons';
import Dropdown from '../../../components/Dropdown';
import ActionStrip from '../../../components/mobile/ActionStrip';
import MobileExplorer from '../../../components/mobile/Explorer';
import Footer from '../../../components/mobile/Footer';
import Header from '../../../components/mobile/Header';
import IconButton from '../../../components/mobile/IconButton';
import IDEWrapper from '../../../components/mobile/IDEWrapper';
import Screen from '../../../components/mobile/MobileScreen';
import useAsModal from '../../../components/useAsModal';
import { remSize } from '../../../theme';
import { logoutUser } from '../../User/actions';
import { toggleForceDesktop } from '../actions/editorAccessibility';
import {
  collapseConsole,
  startSketch,
  stopSketch,
  toggleConsole
} from '../actions/ide';
import {
  clearPersistedState,
  getProject,
  saveProject
} from '../actions/project';
import AutosaveHandler from '../components/AutosaveHandler';
import Console from '../components/Console';
import Editor from '../components/Editor';
import { useIDEKeyHandlers } from '../components/IDEKeyHandlers';
import Toast from '../components/Toast';
import UnsavedChangesIndicator from '../components/UnsavedChangesIndicator';

import { selectActiveFile } from '../selectors/files';
import { selectUsername } from '../selectors/users';

const Expander = styled.div`
  height: ${(props) => (props.expanded ? remSize(160) : remSize(27))};
`;

const NavItem = styled.li`
  position: relative;
`;

const NavMenu = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const username = useSelector(selectUsername);

  return (
    <Dropdown
      align="right"
      items={[
        {
          icon: PreferencesIcon,
          title: t('MobileIDEView.Preferences'),
          href: '/preferences'
        },
        username
          ? {
              icon: PreferencesIcon,
              title: t('MobileIDEView.MyStuff'),
              href: `/${username}/sketches`
            }
          : null,
        {
          icon: PreferencesIcon,
          title: t('MobileIDEView.Examples'),
          href: '/p5/sketches'
        },
        {
          icon: PreferencesIcon,
          title: t('MobileIDEView.OriginalEditor'),
          action: () => dispatch(toggleForceDesktop())
        },
        username
          ? {
              icon: PreferencesIcon,
              title: t('MobileIDEView.Logout'),
              action: () => dispatch(logoutUser())
            }
          : {
              icon: PreferencesIcon,
              title: t('MobileIDEView.Login'),
              href: '/login'
            }
      ].filter(Boolean)}
    />
  );
};

const MobileIDEView = ({ params }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const project = useSelector((state) => state.project);

  const [cmController, setCmController] = useState(null);

  const consoleIsExpanded = useSelector((state) => state.ide.consoleIsExpanded);

  const selectedFile = useSelector(selectActiveFile);
  const { name: filename } = selectedFile;

  // Force state reset
  useEffect(() => {
    dispatch(clearPersistedState());
    dispatch(stopSketch());
    dispatch(collapseConsole());
  }, []);

  // Load Project
  useEffect(() => {
    if (
      params.project_id &&
      params.username &&
      params.project_id !== project.id
    ) {
      dispatch(getProject(params.project_id, params.username));
    }
  }, [dispatch, params, project.id]);

  // Screen Modals
  const [toggleNavDropdown, NavDropDown] = useAsModal(<NavMenu />);

  const [toggleExplorer, Explorer] = useAsModal(
    (toggle) => <MobileExplorer canEdit={false} onPressClose={toggle} />,
    true
  );

  useIDEKeyHandlers({
    getContent: () => cmController.getContent()
  });

  return (
    <Screen>
      <AutosaveHandler />
      <Explorer />
      <Header
        title={
          <span>
            {project.name}
            <UnsavedChangesIndicator />
          </span>
        }
        subtitle={filename}
      >
        <NavItem>
          <IconButton
            onClick={toggleNavDropdown}
            icon={MoreIcon}
            aria-label="Options" // TODO: translation
          />
          <NavDropDown />
        </NavItem>
        <li>
          <IconButton
            to="/preview"
            onClick={() => {
              dispatch(startSketch());
            }}
            icon={PlayIcon}
            aria-label={t('Toolbar.PlaySketchARIA')}
          />
        </li>
      </Header>
      <Toast />

      <IDEWrapper>
        <Editor provideController={setCmController} />
      </IDEWrapper>

      <Footer>
        {consoleIsExpanded && (
          <Expander expanded>
            <Console />
          </Expander>
        )}
        <ActionStrip
          actions={[
            {
              icon: TerminalIcon,
              aria: consoleIsExpanded
                ? t('Console.CloseARIA')
                : t('Console.OpenARIA'),
              action: () => dispatch(toggleConsole()),
              inverted: true
            },
            {
              icon: SaveIcon,
              aria: t('Common.Save'), // TODO: translation for 'Save project'?
              action: () =>
                dispatch(saveProject(cmController.getContent(), false, true))
            },
            {
              icon: FolderIcon,
              aria: t('Editor.OpenSketchARIA'),
              action: toggleExplorer
            }
          ]}
        />
      </Footer>
    </Screen>
  );
};

MobileIDEView.propTypes = {
  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string
  }).isRequired
};

export default withRouter(MobileIDEView);
