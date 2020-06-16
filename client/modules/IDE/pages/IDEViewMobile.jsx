import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { useState } from 'react';

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
import { prop, remSize } from '../../../theme';
import { CloseIcon } from '../../../common/Icons';

import PreferencesIcon from '../../../images/preferences.svg';
import PlayIcon from '../../../images/triangle-arrow-right.svg';

import IconButton from '../../../components/mobile/IconButton';
import Header from '../../../components/mobile/Header';
import Screen from '../../../components/mobile/MobileScreen';
import Footer from '../../../components/mobile/Footer';

const background = prop('Button.default.background');
const textColor = prop('primaryTextColor');

const Content = styled.div`
  z-index: 0;
  margin-top: ${remSize(16)};
`;


const isUserOwner = ({ project, user }) => (project.owner && project.owner.id === user.id);

const IDEViewMobile = (props) => {
  const {
    preferences, ide, editorAccessibility, project, updateLintMessage, clearLintMessage, selectedFile, updateFileContent, files, closeEditorOptions, showEditorOptions, showKeyboardShortcutModal, setUnsavedChanges, startRefreshSketch, stopSketch, expandSidebar, collapseSidebar, clearConsole, console, showRuntimeErrorWarning, hideRuntimeErrorWarning
  } = props;

  const [tmController, setTmController] = useState(null);

  const [overlay, setOverlay] = useState(null);

  return (
    <Screen>
      <Header>
        <Link to="/" style={{ width: '3rem', marginRight: '1.25rem' }}>
          <CloseIcon viewBox="20 21 60 60" aria-hidden="true" aria-label="close header" />
        </Link>
        <div>
          <h2>{project.name}</h2>
          <h3>{selectedFile.name}</h3>
        </div>

        <div style={{ marginLeft: '2rem' }}>
          <IconButton onClick={() => setOverlay('preferences')}>
            <PreferencesIcon focusable="false" aria-hidden="true" />
          </IconButton>
          <IconButton onClick={() => setOverlay('runSketch')}>
            <PlayIcon viewBox="-1 -1 7 7" focusable="false" aria-hidden="true" />
          </IconButton>
        </div>
      </Header>

      <Content>
        <Editor
          lintWarning={preferences.lintWarning}
          linewrap={preferences.linewrap}
          lintMessages={editorAccessibility.lintMessages}
          updateLintMessage={updateLintMessage}
          clearLintMessage={clearLintMessage}
          file={selectedFile}
          updateFileContent={updateFileContent}
          fontSize={preferences.fontSize}
          lineNumbers={preferences.lineNumbers}
          files={files}
          editorOptionsVisible={ide.editorOptionsVisible}
          showEditorOptions={showEditorOptions}
          closeEditorOptions={closeEditorOptions}
          showKeyboardShortcutModal={showKeyboardShortcutModal}
          setUnsavedChanges={setUnsavedChanges}
          isPlaying={ide.isPlaying}
          theme={preferences.theme}
          startRefreshSketch={startRefreshSketch}
          stopSketch={stopSketch}
          autorefresh={preferences.autorefresh}
          unsavedChanges={ide.unsavedChanges}
          projectSavedTime={project.updatedAt}
          isExpanded={ide.sidebarIsExpanded}
          expandSidebar={expandSidebar}
          collapseSidebar={collapseSidebar}
          isUserOwner={isUserOwner(props)}
          clearConsole={clearConsole}
          consoleEvents={console}
          showRuntimeErrorWarning={showRuntimeErrorWarning}
          hideRuntimeErrorWarning={hideRuntimeErrorWarning}
          runtimeErrorWarningVisible={ide.runtimeErrorWarningVisible}
          provideController={setTmController}
        />
      </Content>
      <Footer><h2>Bottom Bar</h2></Footer>
    </Screen>
  );
};


IDEViewMobile.propTypes = {

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
    autorefresh: PropTypes.bool.isRequired
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
    unsavedChanges: PropTypes.bool.isRequired,
    infiniteLoop: PropTypes.bool.isRequired,
    previewIsRefreshing: PropTypes.bool.isRequired,
    infiniteLoopMessage: PropTypes.string.isRequired,
    projectSavedTime: PropTypes.string,
    previousPath: PropTypes.string.isRequired,
    justOpenedProject: PropTypes.bool.isRequired,
    errorType: PropTypes.string,
    runtimeErrorWarningVisible: PropTypes.bool.isRequired,
    uploadFileModalVisible: PropTypes.bool.isRequired
  }).isRequired,

  editorAccessibility: PropTypes.shape({
    lintMessages: PropTypes.array.isRequired,
  }).isRequired,

  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.string
    }),
    updatedAt: PropTypes.string
  }).isRequired,

  updateLintMessage: PropTypes.func.isRequired,

  clearLintMessage: PropTypes.func.isRequired,

  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,

  updateFileContent: PropTypes.func.isRequired,

  files: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
  })).isRequired,

  closeEditorOptions: PropTypes.func.isRequired,

  showEditorOptions: PropTypes.func.isRequired,

  showKeyboardShortcutModal: PropTypes.func.isRequired,

  setUnsavedChanges: PropTypes.func.isRequired,

  startRefreshSketch: PropTypes.func.isRequired,

  stopSketch: PropTypes.func.isRequired,

  expandSidebar: PropTypes.func.isRequired,

  collapseSidebar: PropTypes.func.isRequired,

  clearConsole: PropTypes.func.isRequired,

  console: PropTypes.arrayOf(PropTypes.shape({
    method: PropTypes.string.isRequired,
    args: PropTypes.arrayOf(PropTypes.string)
  })).isRequired,

  showRuntimeErrorWarning: PropTypes.func.isRequired,

  hideRuntimeErrorWarning: PropTypes.func.isRequired,

  user: PropTypes.shape({
    authenticated: PropTypes.bool.isRequired,
    id: PropTypes.string,
    username: PropTypes.string
  }).isRequired,
};


function mapStateToProps(state) {
  return {
    files: state.files,
    selectedFile: state.files.find(file => file.isSelectedFile) ||
      state.files.find(file => file.name === 'sketch.js') ||
      state.files.find(file => file.name !== 'root'),
    htmlFile: getHTMLFile(state.files),
    ide: state.ide,
    preferences: state.preferences,
    editorAccessibility: state.editorAccessibility,
    user: state.user,
    project: state.project,
    toast: state.toast,
    console: state.console
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


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(IDEViewMobile));
