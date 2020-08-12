import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { useState } from 'react';
import styled from 'styled-components';

// Imports to be Refactored
import { bindActionCreators } from 'redux';

import * as FileActions from '../actions/files';
import * as IDEActions from '../actions/ide';
import * as ProjectActions from '../actions/project';
import * as EditorAccessibilityActions from '../actions/editorAccessibility';
import * as PreferencesActions from '../actions/preferences';
import * as UserActions from '../../User/actions';
import * as ToastActions from '../actions/toast';
import * as ConsoleActions from '../actions/console';
import { getHTMLFile } from '../reducers/files';

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

const isUserOwner = ({ project, user }) =>
  project.owner && project.owner.id === user.id;

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

const MobileIDEView = (props) => {
  const {
    ide, project, selectedFile, user, params,
    stopSketch, startSketch, getProject, clearPersistedState
  } = props;

  const [tmController, setTmController] = useState(null); // eslint-disable-line

  const { username } = user;
  const { unsavedChanges } = ide;

  const [triggerNavDropdown, NavDropDown] = useAsModal(<Dropdown
    items={getNatOptions(username)}
    align="right"
  />);

  // Force state reset
  useEffect(clearPersistedState, []);
  useEffect(stopSketch, []);

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


  return (
    <Screen fullscreen>
      <Header
        title={withChangeDot(project.name, unsavedChanges)}
        subtitle={selectedFile.name}
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
        <Editor provideController={setTmController} />
      </IDEWrapper>

      <Footer>
        {ide.consoleIsExpanded && (
          <Expander expanded>
            <Console />
          </Expander>
        )}
        <ActionStrip />
      </Footer>
    </Screen>
  );
};

MobileIDEView.propTypes = {
  preferences: PropTypes.shape({
    fontSize: PropTypes.number.isRequired,
    autosave: PropTypes.bool.isRequired,
    linewrap: PropTypes.bool.isRequired,
    lineNumbers: PropTypes.bool.isRequired,
    lintWarning: PropTypes.bool.isRequired,
    textOutput: PropTypes.bool.isRequired,
    gridOutput: PropTypes.bool.isRequired,
    soundOutput: PropTypes.bool.isRequired,
    theme: PropTypes.string.isRequired,
    autorefresh: PropTypes.bool.isRequired,
  }).isRequired,

  ide: PropTypes.shape({
    isPlaying: PropTypes.bool.isRequired,
    isAccessibleOutputPlaying: PropTypes.bool.isRequired,
    consoleEvent: PropTypes.array,
    modalIsVisible: PropTypes.bool.isRequired,
    sidebarIsExpanded: PropTypes.bool.isRequired,
    consoleIsExpanded: PropTypes.bool.isRequired,
    preferencesIsVisible: PropTypes.bool.isRequired,
    projectOptionsVisible: PropTypes.bool.isRequired,
    newFolderModalVisible: PropTypes.bool.isRequired,
    shareModalVisible: PropTypes.bool.isRequired,
    shareModalProjectId: PropTypes.string.isRequired,
    shareModalProjectName: PropTypes.string.isRequired,
    shareModalProjectUsername: PropTypes.string.isRequired,
    editorOptionsVisible: PropTypes.bool.isRequired,
    keyboardShortcutVisible: PropTypes.bool.isRequired,
    infiniteLoop: PropTypes.bool.isRequired,
    previewIsRefreshing: PropTypes.bool.isRequired,
    infiniteLoopMessage: PropTypes.string.isRequired,
    projectSavedTime: PropTypes.string,
    previousPath: PropTypes.string.isRequired,
    justOpenedProject: PropTypes.bool.isRequired,
    errorType: PropTypes.string,
    runtimeErrorWarningVisible: PropTypes.bool.isRequired,
    uploadFileModalVisible: PropTypes.bool.isRequired,

    unsavedChanges: PropTypes.bool.isRequired,
  }).isRequired,

  editorAccessibility: PropTypes.shape({
    lintMessages: PropTypes.array.isRequired,
  }).isRequired,

  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.string,
    }),
    updatedAt: PropTypes.string,
  }).isRequired,

  startSketch: PropTypes.func.isRequired,
  stopSketch: PropTypes.func.isRequired,


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

  getProject: PropTypes.func.isRequired,
  clearPersistedState: PropTypes.func.isRequired,
  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    files: state.files,
    selectedFile:
      state.files.find(file => file.isSelectedFile) ||
      state.files.find(file => file.name === 'sketch.js') ||
      state.files.find(file => file.name !== 'root'),
    htmlFile: getHTMLFile(state.files),
    ide: state.ide,
    unsavedChanges: state.ide.unsavedChanged,
    preferences: state.preferences,
    editorAccessibility: state.editorAccessibility,
    user: state.user,
    project: state.project,
    toast: state.toast,
    console: state.console,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign(
      {},
      EditorAccessibilityActions,
      FileActions,
      ProjectActions,
      IDEActions,
      PreferencesActions,
      UserActions,
      ToastActions,
      ConsoleActions
    ),
    dispatch
  );
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MobileIDEView));
