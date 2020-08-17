import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { useState } from 'react';
import styled from 'styled-components';

// Imports to be Refactored
import { bindActionCreators } from 'redux';

import * as IDEActions from '../actions/ide';
import * as ProjectActions from '../actions/project';
import * as ConsoleActions from '../actions/console';
import * as PreferencesActions from '../actions/preferences';


// Local Imports
import Editor from '../components/Editor';
import { PlayIcon, MoreIcon } from '../../../common/icons';
import UnsavedChangesDotIcon from '../../../images/unsaved-changes-dot.svg';

import IconButton from '../../../components/mobile/IconButton';
import Header from '../../../components/mobile/Header';
import Screen from '../../../components/mobile/MobileScreen';
import Footer from '../../../components/mobile/Footer';
import IDEWrapper from '../../../components/mobile/IDEWrapper';
import Console from '../components/Console';
import { remSize } from '../../../theme';
// import OverlayManager from '../../../components/OverlayManager';
import ActionStrip from '../../../components/mobile/ActionStrip';
import useAsModal from '../../../components/useAsModal';
import { PreferencesIcon } from '../../../common/icons';
import Dropdown from '../../../components/Dropdown';

import { useEffectWithComparison, useEventListener } from '../../../utils/custom-hooks';

import * as device from '../../../utils/device';

const withChangeDot = (title, unsavedChanges = false) => (
  <span>
    {title}
    <span className="editor__unsaved-changes">
      {unsavedChanges &&
      <UnsavedChangesDotIcon role="img" aria-label="Sketch has unsaved changes" focusable="false" />}
    </span>
  </span>
);

const Expander = styled.div`
  height: ${props => (props.expanded ? remSize(160) : remSize(27))};
`;

const NavItem = styled.li`
  position: relative;
`;

const getNatOptions = (username = undefined) =>
  (username
    ? [
      { icon: PreferencesIcon, title: 'Preferences', href: '/mobile/preferences', },
      { icon: PreferencesIcon, title: 'My Stuff', href: `/mobile/${username}/sketches` },
      { icon: PreferencesIcon, title: 'Examples', href: '/mobile/p5/sketches' },
      { icon: PreferencesIcon, title: 'Original Editor', href: '/', },
    ]
    : [
      { icon: PreferencesIcon, title: 'Preferences', href: '/mobile/preferences', },
      { icon: PreferencesIcon, title: 'Examples', href: '/mobile/p5/sketches' },
      { icon: PreferencesIcon, title: 'Original Editor', href: '/', },
    ]
  );


const isUserOwner = ({ project, user }) =>
  project && project.owner && project.owner.id === user.id;

const canSaveProject = (project, user) =>
  isUserOwner({ project, user }) || (user.authenticated && !project.owner);

// TODO: This could go into <Editor />
const handleGlobalKeydown = (props, cmController) => (e) => {
  const {
    user, project, ide,
    setAllAccessibleOutput,
    saveProject, cloneProject, showErrorModal, startSketch, stopSketch,
    expandSidebar, collapseSidebar, expandConsole, collapseConsole,
    closeNewFolderModal, closeUploadFileModal, closeNewFileModal
  } = props;


  const isMac = device.isMac();

  // const ctrlDown = (e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac);
  const ctrlDown = (isMac ? e.metaKey : e.ctrlKey);

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
      } else if (e.keyCode === 50
      ) {
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
      if (canSaveProject(project, user)) saveProject(cmController.getContent(), false, true);
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


const autosave = (autosaveInterval, setAutosaveInterval) => (props, prevProps) => {
  const {
    autosaveProject, preferences, ide, selectedFile: file, project, user
  } = props;

  const { selectedFile: oldFile } = prevProps;

  const doAutosave = () => autosaveProject(true);

  console.log(user);

  console.log(isUserOwner(props), project);

  if (isUserOwner(props) && project.id) {
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

const MobileIDEView = (props) => {
  const {
    ide, preferences, project, selectedFile, user, params, unsavedChanges, collapseConsole,
    stopSketch, startSketch, getProject, clearPersistedState, autosaveProject
  } = props;


  const [cmController, setCmController] = useState(null); // eslint-disable-line

  const { username } = user;
  const { consoleIsExpanded } = ide;
  const { name: filename } = selectedFile;

  const [triggerNavDropdown, NavDropDown] = useAsModal(<Dropdown
    items={getNatOptions(username)}
    align="right"
  />);

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


  // TODO: This behavior could move to <Editor />
  const [autosaveInterval, setAutosaveInterval] = useState(null);
  useEffectWithComparison(autosave(autosaveInterval, setAutosaveInterval), {
    autosaveProject, preferences, ide, selectedFile, project, user
  });

  useEventListener('keydown', handleGlobalKeydown(props, cmController), false, [props]);


  return (
    <Screen fullscreen>
      <Header
        title={withChangeDot(project.name, unsavedChanges)}
        subtitle={filename}
      >
        <NavItem>
          <IconButton
            onClick={triggerNavDropdown}
            icon={MoreIcon}
            aria-label="Options"
          />
          <NavDropDown />
        </NavItem>
        <li>
          <IconButton to="/mobile/preview" onClick={() => { startSketch(); }} icon={PlayIcon} aria-label="Run sketch" />
        </li>
      </Header>

      <IDEWrapper>
        <Editor provideController={setCmController} />
      </IDEWrapper>

      <Footer>
        {consoleIsExpanded && (
          <Expander expanded>
            <Console />
          </Expander>
        )}
        <ActionStrip />
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
};

MobileIDEView.propTypes = {
  ide: PropTypes.shape({
    consoleIsExpanded: PropTypes.bool.isRequired,
  }).isRequired,

  preferences: PropTypes.shape({
  }).isRequired,

  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.string,
    }),
  }).isRequired,


  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,

  user: PropTypes.shape({
    authenticated: PropTypes.bool.isRequired,
    id: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,

  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string
  }).isRequired,

  unsavedChanges: PropTypes.bool.isRequired,

  startSketch: PropTypes.func.isRequired,
  stopSketch: PropTypes.func.isRequired,
  getProject: PropTypes.func.isRequired,
  clearPersistedState: PropTypes.func.isRequired,
  autosaveProject: PropTypes.func.isRequired,


  ...handleGlobalKeydownProps
};

function mapStateToProps(state) {
  return {
    selectedFile:
      state.files.find(file => file.isSelectedFile) ||
      state.files.find(file => file.name === 'sketch.js') ||
      state.files.find(file => file.name !== 'root'),
    ide: state.ide,
    unsavedChanges: state.ide.unsavedChanges,
    preferences: state.preferences,
    user: state.user,
    project: state.project,
    toast: state.toast,
    console: state.console,
  };
}

const mapDispatchToProps = dispatch => bindActionCreators({
  ...ProjectActions,
  ...IDEActions,
  ...ConsoleActions,
  ...PreferencesActions
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MobileIDEView));
