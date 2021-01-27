import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

// Imports to be Refactored
import { bindActionCreators } from 'redux';

import * as IDEActions from '../actions/ide';
import * as ProjectActions from '../actions/project';
import * as ConsoleActions from '../actions/console';
import * as PreferencesActions from '../actions/preferences';
import * as EditorAccessibilityActions from '../actions/editorAccessibility';

// Local Imports
import Editor from '../components/Editor';

import {
  PlayIcon,
  MoreIcon,
  FolderIcon,
  PreferencesIcon,
  TerminalIcon,
  SaveIcon
} from '../../../common/icons';
import UnsavedChangesDotIcon from '../../../images/unsaved-changes-dot.svg';

import IconButton from '../../../components/mobile/IconButton';
import Header from '../../../components/mobile/Header';
import Toast from '../components/Toast';
import Screen from '../../../components/mobile/MobileScreen';
import Footer from '../../../components/mobile/Footer';
import IDEWrapper from '../../../components/mobile/IDEWrapper';
import MobileExplorer from '../../../components/mobile/Explorer';
import Console from '../components/Console';
import { remSize } from '../../../theme';

import ActionStrip from '../../../components/mobile/ActionStrip';
import useAsModal from '../../../components/useAsModal';
import Dropdown from '../../../components/Dropdown';
import { getIsUserOwner } from '../selectors/users';

import {
  useEffectWithComparison,
  useEventListener
} from '../../../utils/custom-hooks';

import * as device from '../../../utils/device';

const withChangeDot = (title, unsavedChanges = false) => (
  <span>
    {title}
    <span className="editor__unsaved-changes">
      {unsavedChanges && (
        <UnsavedChangesDotIcon
          role="img"
          aria-label="Sketch has unsaved changes"
          focusable="false"
        />
      )}
    </span>
  </span>
);
const getRootFile = (files) =>
  files && files.filter((file) => file.name === 'root')[0];
const getRootFileID = (files) =>
  ((root) => root && root.id)(getRootFile(files));

const Expander = styled.div`
  height: ${(props) => (props.expanded ? remSize(160) : remSize(27))};
`;

const NavItem = styled.li`
  position: relative;
`;

const getNavOptions = (
  username = undefined,
  logoutUser = () => {},
  toggleForceDesktop = () => {}
) => {
  const { t } = useTranslation();
  return username
    ? [
      {
        icon: PreferencesIcon,
        title: t('MobileIDEView.Preferences'),
        href: '/preferences'
      },
      {
        icon: PreferencesIcon,
        title: t('MobileIDEView.MyStuff'),
        href: `/${username}/sketches`
      },
      {
        icon: PreferencesIcon,
        title: t('MobileIDEView.Examples'),
        href: '/p5/sketches'
      },
      {
        icon: PreferencesIcon,
        title: t('MobileIDEView.OriginalEditor'),
        action: toggleForceDesktop
      },
      {
        icon: PreferencesIcon,
        title: t('MobileIDEView.Logout'),
        action: logoutUser
      }
    ]
    : [
      {
        icon: PreferencesIcon,
        title: t('MobileIDEView.Preferences'),
        href: '/preferences'
      },
      {
        icon: PreferencesIcon,
        title: t('MobileIDEView.Examples'),
        href: '/p5/sketches'
      },
      {
        icon: PreferencesIcon,
        title: t('MobileIDEView.OriginalEditor'),
        action: toggleForceDesktop
      },
      {
        icon: PreferencesIcon,
        title: t('MobileIDEView.Login'),
        href: '/login'
      }
    ];
};

const canSaveProject = (isUserOwner, project, user) =>
  isUserOwner || (user.authenticated && !project.owner);

// TODO: This could go into <Editor />
const handleGlobalKeydown = (props, cmController) => (e) => {
  const {
    user,
    project,
    ide,
    setAllAccessibleOutput,
    saveProject,
    cloneProject,
    showErrorModal,
    startSketch,
    stopSketch,
    expandSidebar,
    collapseSidebar,
    expandConsole,
    collapseConsole,
    closeNewFolderModal,
    closeUploadFileModal,
    closeNewFileModal,
    isUserOwner
  } = props;

  const isMac = device.isMac();

  // const ctrlDown = (e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac);
  const ctrlDown = isMac ? e.metaKey : e.ctrlKey;

  if (ctrlDown) {
    if (e.shiftKey) {
      if (e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        stopSketch();
      } else if (e.keyCode === 13) {
        e.preventDefault();
        e.stopPropagation();
        startSketch();
        // 50 === 2
      } else if (e.keyCode === 50) {
        e.preventDefault();
        setAllAccessibleOutput(false);
        // 49 === 1
      } else if (e.keyCode === 49) {
        e.preventDefault();
        setAllAccessibleOutput(true);
      }
    } else if (e.keyCode === 83) {
      // 83 === s
      e.preventDefault();
      e.stopPropagation();
      if (canSaveProject(isUserOwner, project, user))
        saveProject(cmController.getContent(), false, true);
      else if (user.authenticated) cloneProject();
      else showErrorModal('forceAuthentication');

      // 13 === enter
    } else if (e.keyCode === 66) {
      e.preventDefault();
      if (!ide.sidebarIsExpanded) expandSidebar();
      else collapseSidebar();
    }
  } else if (e.keyCode === 192 && e.ctrlKey) {
    e.preventDefault();
    if (ide.consoleIsExpanded) collapseConsole();
    else expandConsole();
  } else if (e.keyCode === 27) {
    if (ide.newFolderModalVisible) closeNewFolderModal();
    else if (ide.uploadFileModalVisible) closeUploadFileModal();
    else if (ide.modalIsVisible) closeNewFileModal();
  }
};

const autosave = (autosaveInterval, setAutosaveInterval) => (
  props,
  prevProps
) => {
  const {
    autosaveProject,
    preferences,
    ide,
    selectedFile: file,
    project,
    isUserOwner
  } = props;

  const { selectedFile: oldFile } = prevProps;

  const doAutosave = () => autosaveProject(true);

  if (props.isUserOwner && project.id) {
    if (preferences.autosave && ide.unsavedChanges && !ide.justOpenedProject) {
      if (file.name === oldFile.name && file.content !== oldFile.content) {
        if (autosaveInterval) {
          clearTimeout(autosaveInterval);
        }
        console.log('will save project in 20 seconds');
        setAutosaveInterval(setTimeout(doAutosave, 20000));
      }
    } else if (autosaveInterval && !preferences.autosave) {
      clearTimeout(autosaveInterval);
      setAutosaveInterval(null);
    }
  } else if (autosaveInterval) {
    clearTimeout(autosaveInterval);
    setAutosaveInterval(null);
  }
};

// ide, preferences, project, selectedFile, user, params, unsavedChanges, expandConsole, collapseConsole,
// stopSketch, startSketch, getProject, clearPersistedState, autosaveProject, saveProject, files

const MobileIDEView = (props) => {
  // const {
  //   preferences, ide, editorAccessibility, project, updateLintMessage, clearLintMessage,
  //   selectedFile, updateFileContent, files, user, params,
  //   closeEditorOptions, showEditorOptions, logoutUser,
  //   startRefreshSketch, stopSketch, expandSidebar, collapseSidebar, clearConsole, console,
  //   showRuntimeErrorWarning, hideRuntimeErrorWarning, startSketch, getProject, clearPersistedState, setUnsavedChanges,
  //   toggleForceDesktop
  // } = props;

  const {
    ide,
    preferences,
    project,
    selectedFile,
    user,
    params,
    unsavedChanges,
    expandConsole,
    collapseConsole,
    stopSketch,
    startSketch,
    getProject,
    clearPersistedState,
    autosaveProject,
    saveProject,
    files,
    toggleForceDesktop,
    logoutUser,
    toast,
    isUserOwner
  } = props;

  const [cmController, setCmController] = useState(null); // eslint-disable-line

  const { username } = user;
  const { consoleIsExpanded } = ide;
  const { name: filename } = selectedFile;

  // Force state reset
  useEffect(clearPersistedState, []);
  useEffect(() => {
    stopSketch();
    collapseConsole();
  }, []);

  // Load Project
  const [currentProjectID, setCurrentProjectID] = useState(null);
  useEffect(() => {
    if (!username) return;
    if (params.project_id && !currentProjectID) {
      if (params.project_id !== project.id) {
        getProject(params.project_id, params.username);
      }
    }
    setCurrentProjectID(params.project_id);
  }, [params, project, username]);

  // Screen Modals
  const [toggleNavDropdown, NavDropDown] = useAsModal(
    <Dropdown
      items={getNavOptions(username, logoutUser, toggleForceDesktop)}
      align="right"
    />
  );

  const [toggleExplorer, Explorer] = useAsModal(
    (toggle) => (
      <MobileExplorer
        id={getRootFileID(files)}
        canEdit={false}
        onPressClose={toggle}
      />
    ),
    true
  );

  // TODO: This behavior could move to <Editor />
  const [autosaveInterval, setAutosaveInterval] = useState(null);
  useEffectWithComparison(autosave(autosaveInterval, setAutosaveInterval), {
    autosaveProject,
    preferences,
    ide,
    selectedFile,
    project,
    user,
    isUserOwner
  });

  useEventListener('keydown', handleGlobalKeydown(props, cmController), false, [
    props
  ]);

  const projectActions = [
    {
      icon: TerminalIcon,
      aria: 'Toggle console open/closed',
      action: consoleIsExpanded ? collapseConsole : expandConsole,
      inverted: true
    },
    {
      icon: SaveIcon,
      aria: 'Save project',
      action: () => saveProject(cmController.getContent(), false, true)
    },
    { icon: FolderIcon, aria: 'Open files explorer', action: toggleExplorer }
  ];

  return (
    <Screen fullscreen>
      <Explorer />
      <Header
        title={withChangeDot(project.name, unsavedChanges)}
        subtitle={filename}
      >
        <NavItem>
          <IconButton
            onClick={toggleNavDropdown}
            icon={MoreIcon}
            aria-label="Options"
          />
          <NavDropDown />
        </NavItem>
        <li>
          <IconButton
            to="/preview"
            onClick={() => {
              startSketch();
            }}
            icon={PlayIcon}
            aria-label="Run sketch"
          />
        </li>
      </Header>
      {toast.isVisible && <Toast />}

      <IDEWrapper>
        <Editor provideController={setCmController} />
      </IDEWrapper>

      <Footer>
        {consoleIsExpanded && (
          <Expander expanded>
            <Console />
          </Expander>
        )}
        <ActionStrip actions={projectActions} />
      </Footer>
    </Screen>
  );
};

const handleGlobalKeydownProps = {
  expandConsole: PropTypes.func.isRequired,
  collapseConsole: PropTypes.func.isRequired,
  expandSidebar: PropTypes.func.isRequired,
  collapseSidebar: PropTypes.func.isRequired,

  setAllAccessibleOutput: PropTypes.func.isRequired,
  saveProject: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  showErrorModal: PropTypes.func.isRequired,

  closeNewFolderModal: PropTypes.func.isRequired,
  closeUploadFileModal: PropTypes.func.isRequired,
  closeNewFileModal: PropTypes.func.isRequired,
  isUserOwner: PropTypes.bool.isRequired
};

MobileIDEView.propTypes = {
  ide: PropTypes.shape({
    consoleIsExpanded: PropTypes.bool.isRequired
  }).isRequired,

  preferences: PropTypes.shape({}).isRequired,

  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.string
    })
  }).isRequired,

  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,

  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired
    })
  ).isRequired,

  toggleForceDesktop: PropTypes.func.isRequired,

  user: PropTypes.shape({
    authenticated: PropTypes.bool.isRequired,
    id: PropTypes.string,
    username: PropTypes.string
  }).isRequired,

  toast: PropTypes.shape({
    isVisible: PropTypes.bool
  }).isRequired,

  logoutUser: PropTypes.func.isRequired,

  getProject: PropTypes.func.isRequired,
  clearPersistedState: PropTypes.func.isRequired,
  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string
  }).isRequired,

  startSketch: PropTypes.func.isRequired,

  unsavedChanges: PropTypes.bool.isRequired,
  autosaveProject: PropTypes.func.isRequired,
  isUserOwner: PropTypes.bool.isRequired,

  ...handleGlobalKeydownProps
};

function mapStateToProps(state) {
  return {
    selectedFile:
      state.files.find((file) => file.isSelectedFile) ||
      state.files.find((file) => file.name === 'sketch.js') ||
      state.files.find((file) => file.name !== 'root'),
    ide: state.ide,
    files: state.files,
    unsavedChanges: state.ide.unsavedChanges,
    preferences: state.preferences,
    user: state.user,
    project: state.project,
    toast: state.toast,
    console: state.console,
    isUserOwner: getIsUserOwner(state)
  };
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ...ProjectActions,
      ...IDEActions,
      ...ConsoleActions,
      ...PreferencesActions,
      ...EditorAccessibilityActions
    },
    dispatch
  );

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MobileIDEView)
);
