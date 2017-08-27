import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import SplitPane from 'react-split-pane';
import Editor from '../components/Editor';
import Sidebar from '../components/Sidebar';
import PreviewFrame from '../components/PreviewFrame';
import Toolbar from '../components/Toolbar';
import AccessibleOutput from '../components/AccessibleOutput';
import Preferences from '../components/Preferences';
import NewFileModal from '../components/NewFileModal';
import NewFolderModal from '../components/NewFolderModal';
import ShareModal from '../components/ShareModal';
import KeyboardShortcutModal from '../components/KeyboardShortcutModal';
import ErrorModal from '../components/ErrorModal';
import HelpModal from '../components/HelpModal';
import Nav from '../../../components/Nav';
import Console from '../components/Console';
import Toast from '../components/Toast';
import * as FileActions from '../actions/files';
import * as IDEActions from '../actions/ide';
import * as ClassroomActions from '../actions/classroom';
import * as ProjectActions from '../actions/project';
import * as EditorAccessibilityActions from '../actions/editorAccessibility';
import * as PreferencesActions from '../actions/preferences';
import * as UserActions from '../../User/actions';
import * as ToastActions from '../actions/toast';
import * as ConsoleActions from '../actions/console';
import { getHTMLFile } from '../reducers/files';
import Overlay from '../../App/components/Overlay';
import SketchList from '../components/SketchList';
import ClassroomList from '../components/ClassroomList';
import ClassroomView from '../components/ClassroomView';
import ClassroomSettingsForm from '../components/ClassroomSettings';
import SubmitSketch from '../components/SubmitSketch';
import About from '../components/About';

class IDEView extends React.Component {
  constructor(props) {
    super(props);
    this._handleConsolePaneOnDragFinished = this._handleConsolePaneOnDragFinished.bind(this);
    this._handleSidebarPaneOnDragFinished = this._handleSidebarPaneOnDragFinished.bind(this);
    this.handleGlobalKeydown = this.handleGlobalKeydown.bind(this);
    this.warnIfUnsavedChanges = this.warnIfUnsavedChanges.bind(this);
  }

  componentDidMount() {
    // If page doesn't reload after Sign In then we need
    // to force cleared state to be cleared
    this.props.clearPersistedState();

    this.props.stopSketch();
    if (this.props.params.project_id) {
      const id = this.props.params.project_id;
      if (id !== this.props.project.id) {
        this.props.getProject(id);
      }
    }
    if (this.props.params.classroom_id) {
      const id = this.props.params.classroom_id;
      if (id !== this.props.classroom.id) {
        this.props.getClassroom(id);
      }
    }

    this.consoleSize = this.props.ide.consoleIsExpanded ? 150 : 29;
    this.sidebarSize = this.props.ide.sidebarIsExpanded ? 160 : 20;
    this.forceUpdate();

    this.isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1;
    document.addEventListener('keydown', this.handleGlobalKeydown, false);

    this.props.router.setRouteLeaveHook(this.props.route, route => this.warnIfUnsavedChanges(route));

    window.onbeforeunload = () => this.warnIfUnsavedChanges();

    document.body.className = this.props.preferences.theme;
    this.autosaveInterval = null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.props.setPreviousPath(this.props.location.pathname);
    }
  }

  componentWillUpdate(nextProps) {
    if (this.props.ide.consoleIsExpanded !== nextProps.ide.consoleIsExpanded) {
      this.consoleSize = nextProps.ide.consoleIsExpanded ? 150 : 29;
    }

    if (this.props.ide.sidebarIsExpanded !== nextProps.ide.sidebarIsExpanded) {
      this.sidebarSize = nextProps.ide.sidebarIsExpanded ? 160 : 20;
    }

    if (nextProps.params.project_id && !this.props.params.project_id) {
      if (nextProps.params.project_id !== nextProps.project.id) {
        this.props.getProject(nextProps.params.project_id);
      }
    }

    if (nextProps.params.classroom_id && !this.props.params.classroom_id) {
      this.props.getClassroom(nextProps.params.classroom_id);
    }

    if (nextProps.preferences.theme !== this.props.preferences.theme) {
      document.body.className = nextProps.preferences.theme;
    }
  }

  componentDidUpdate(prevProps) {
    if (this.isUserOwner() && this.props.project.id) {
      if (this.props.preferences.autosave && this.props.ide.unsavedChanges && !this.props.ide.justOpenedProject) {
        if (this.props.selectedFile.name === prevProps.selectedFile.name && this.props.selectedFile.content !== prevProps.selectedFile.content) {
          if (this.autosaveInterval) {
            clearTimeout(this.autosaveInterval);
          }
          console.log('will save project in 20 seconds');
          this.autosaveInterval = setTimeout(this.props.autosaveProject, 20000);
        }
      } else if (this.autosaveInterval && !this.props.preferences.autosave) {
        clearTimeout(this.autosaveInterval);
        this.autosaveInterval = null;
      }
    } else if (this.autosaveInterval) {
      clearTimeout(this.autosaveInterval);
      this.autosaveInterval = null;
    }

    if (this.props.route.path !== prevProps.route.path) {
      this.props.router.setRouteLeaveHook(this.props.route, route => this.warnIfUnsavedChanges(route));
    }
  }

  componentWillUnmount() {
    clearTimeout(this.autosaveInterval);
    this.autosaveInterval = null;
    this.consoleSize = undefined;
    this.sidebarSize = undefined;
  }

  isUserOwner() {
    return this.props.project.owner && this.props.project.owner.id === this.props.user.id;
  }

  _handleConsolePaneOnDragFinished() {
    this.consoleSize = this.consolePane.state.draggedSize;
    this.consolePane.setState({
      resized: false,
      draggedSize: undefined,
    });
  }

  _handleSidebarPaneOnDragFinished() {
    this.sidebarSize = this.sidebarPane.state.draggedSize;
    this.sidebarPane.setState({
      resized: false,
      draggedSize: undefined
    });
  }

  handleGlobalKeydown(e) {
    // 83 === s
    if (e.keyCode === 83 && ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))) {
      e.preventDefault();
      e.stopPropagation();
      if (this.isUserOwner() || (this.props.user.authenticated && !this.props.project.owner)) {
        this.props.saveProject();
      }
      // 13 === enter
    } else if (e.keyCode === 13 && e.shiftKey && ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))) {
      e.preventDefault();
      e.stopPropagation();
      this.props.stopSketch();
    } else if (e.keyCode === 13 && ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))) {
      e.preventDefault();
      e.stopPropagation();
      this.props.clearConsole();
      this.props.startSketchAndRefresh();
    } else if (e.keyCode === 50 && ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac)) && e.shiftKey) {
      e.preventDefault();
      this.props.setTextOutput(false);
      this.props.setGridOutput(false);
      this.props.setSoundOutput(false);
    } else if (e.keyCode === 49 && ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac)) && e.shiftKey) {
      e.preventDefault();
      this.props.setTextOutput(true);
      this.props.setGridOutput(true);
      this.props.setSoundOutput(true);
    }
  }

  warnIfUnsavedChanges(route) { // eslint-disable-line
    if (route && (route.action === 'PUSH' && (route.pathname === '/login' || route.pathname === '/signup'))) {
      // don't warn
      this.props.persistState();
      window.onbeforeunload = null;
    } else if (route && (this.props.location.pathname === '/login' || this.props.location.pathname === '/signup')) {
      // don't warn
      this.props.persistState();
      window.onbeforeunload = null;
    } else if (this.props.ide.unsavedChanges) {
      if (!window.confirm('Are you sure you want to leave this page? You have unsaved changes.')) {
        return false;
      }
      this.props.setUnsavedChanges(false);
      return true;
    }
  }

  render() {
    return (
      <div className="ide">
        {this.props.toast.isVisible && <Toast />}
        <Nav
          user={this.props.user}
          newProject={this.props.newProject}
          saveProject={this.props.saveProject}
          exportProjectAsZip={this.props.exportProjectAsZip}
          cloneProject={this.props.cloneProject}
          project={this.props.project}
          logoutUser={this.props.logoutUser}
          stopSketch={this.props.stopSketch}
          showShareModal={this.props.showShareModal}
          showErrorModal={this.props.showErrorModal}
          unsavedChanges={this.props.ide.unsavedChanges}
          warnIfUnsavedChanges={this.warnIfUnsavedChanges}
        />
        <Toolbar
          className="Toolbar"
          isPlaying={this.props.ide.isPlaying}
          stopSketch={this.props.stopSketch}
          startAccessibleOutput={this.props.startAccessibleOutput}
          stopAccessibleOutput={this.props.stopAccessibleOutput}
          projectName={this.props.project.name}
          setProjectName={this.props.setProjectName}
          showEditProjectName={this.props.showEditProjectName}
          hideEditProjectName={this.props.hideEditProjectName}
          openPreferences={this.props.openPreferences}
          preferencesIsVisible={this.props.ide.preferencesIsVisible}
          serveSecure={this.props.project.serveSecure}
          setServeSecure={this.props.setServeSecure}
          setTextOutput={this.props.setTextOutput}
          setGridOutput={this.props.setGridOutput}
          setSoundOutput={this.props.setSoundOutput}
          owner={this.props.project.owner}
          project={this.props.project}
          infiniteLoop={this.props.ide.infiniteLoop}
          autorefresh={this.props.preferences.autorefresh}
          setAutorefresh={this.props.setAutorefresh}
          startSketchAndRefresh={this.props.startSketchAndRefresh}
          saveProject={this.props.saveProject}
          currentUser={this.props.user.username}
          clearConsole={this.props.clearConsole}
          showHelpModal={this.props.showHelpModal}
        />
        <Preferences
          isVisible={this.props.ide.preferencesIsVisible}
          closePreferences={this.props.closePreferences}
          fontSize={this.props.preferences.fontSize}
          indentationAmount={this.props.preferences.indentationAmount}
          setIndentation={this.props.setIndentation}
          indentWithSpace={this.props.indentWithSpace}
          indentWithTab={this.props.indentWithTab}
          isTabIndent={this.props.preferences.isTabIndent}
          setFontSize={this.props.setFontSize}
          autosave={this.props.preferences.autosave}
          setAutosave={this.props.setAutosave}
          lintWarning={this.props.preferences.lintWarning}
          setLintWarning={this.props.setLintWarning}
          textOutput={this.props.preferences.textOutput}
          gridOutput={this.props.preferences.gridOutput}
          setTextOutput={this.props.setTextOutput}
          setGridOutput={this.props.setGridOutput}
          setSoundOutput={this.props.setSoundOutput}
          theme={this.props.preferences.theme}
          setTheme={this.props.setTheme}
        />
        <div className="editor-preview-container">
          <SplitPane
            split="vertical"
            defaultSize={this.sidebarSize}
            ref={(element) => { this.sidebarPane = element; }}
            onDragFinished={this._handleSidebarPaneOnDragFinished}
            allowResize={this.props.ide.sidebarIsExpanded}
            minSize={20}
          >
            <Sidebar
              files={this.props.files}
              setSelectedFile={this.props.setSelectedFile}
              newFile={this.props.newFile}
              isExpanded={this.props.ide.sidebarIsExpanded}
              showFileOptions={this.props.showFileOptions}
              hideFileOptions={this.props.hideFileOptions}
              deleteFile={this.props.deleteFile}
              showEditFileName={this.props.showEditFileName}
              hideEditFileName={this.props.hideEditFileName}
              updateFileName={this.props.updateFileName}
              projectOptionsVisible={this.props.ide.projectOptionsVisible}
              openProjectOptions={this.props.openProjectOptions}
              closeProjectOptions={this.props.closeProjectOptions}
              newFolder={this.props.newFolder}
              user={this.props.user}
              owner={this.props.project.owner}
            />
            <SplitPane
              split="vertical"
              defaultSize={'50%'}
              onChange={() => (this.overlay.style.display = 'block')}
              onDragFinished={() => (this.overlay.style.display = 'none')}
            >
              <SplitPane
                split="horizontal"
                primary="second"
                defaultSize={this.consoleSize}
                minSize={29}
                ref={(element) => { this.consolePane = element; }}
                onDragFinished={this._handleConsolePaneOnDragFinished}
                allowResize={this.props.ide.consoleIsExpanded}
                className="editor-preview-subpanel"
              >
                <Editor
                  lintWarning={this.props.preferences.lintWarning}
                  lintMessages={this.props.editorAccessibility.lintMessages}
                  updateLintMessage={this.props.updateLintMessage}
                  clearLintMessage={this.props.clearLintMessage}
                  file={this.props.selectedFile}
                  updateFileContent={this.props.updateFileContent}
                  fontSize={this.props.preferences.fontSize}
                  indentationAmount={this.props.preferences.indentationAmount}
                  isTabIndent={this.props.preferences.isTabIndent}
                  files={this.props.files}
                  editorOptionsVisible={this.props.ide.editorOptionsVisible}
                  showEditorOptions={this.props.showEditorOptions}
                  closeEditorOptions={this.props.closeEditorOptions}
                  showKeyboardShortcutModal={this.props.showKeyboardShortcutModal}
                  setUnsavedChanges={this.props.setUnsavedChanges}
                  isPlaying={this.props.ide.isPlaying}
                  theme={this.props.preferences.theme}
                  startRefreshSketch={this.props.startRefreshSketch}
                  stopSketch={this.props.stopSketch}
                  autorefresh={this.props.preferences.autorefresh}
                  unsavedChanges={this.props.ide.unsavedChanges}
                  projectSavedTime={this.props.project.updatedAt}
                  isExpanded={this.props.ide.sidebarIsExpanded}
                  expandSidebar={this.props.expandSidebar}
                  collapseSidebar={this.props.collapseSidebar}
                  isUserOwner={this.isUserOwner()}
                  clearConsole={this.props.clearConsole}
                />
                <Console
                  consoleEvents={this.props.console}
                  isExpanded={this.props.ide.consoleIsExpanded}
                  expandConsole={this.props.expandConsole}
                  collapseConsole={this.props.collapseConsole}
                  clearConsole={this.props.clearConsole}
                />
              </SplitPane>
              <div className="preview-frame-holder">
                <header className="preview-frame__header">
                  <h2 className="preview-frame__title">Preview</h2>
                </header>
                <div className="preview-frame-overlay" ref={(element) => { this.overlay = element; }}>
                </div>
                <div>
                  {(() => {
                    if (((this.props.preferences.textOutput || this.props.preferences.gridOutput || this.props.preferences.soundOutput) && this.props.ide.isPlaying) || this.props.ide.isAccessibleOutputPlaying) {
                      return (
                        <AccessibleOutput
                          isPlaying={this.props.ide.isPlaying}
                          previewIsRefreshing={this.props.ide.previewIsRefreshing}
                          textOutput={this.props.preferences.textOutput}
                          gridOutput={this.props.preferences.gridOutput}
                        />
                      );
                    }
                    return '';
                  })()}
                </div>
                <PreviewFrame
                  htmlFile={this.props.htmlFile}
                  files={this.props.files}
                  content={this.props.selectedFile.content}
                  isPlaying={this.props.ide.isPlaying}
                  isAccessibleOutputPlaying={this.props.ide.isAccessibleOutputPlaying}
                  textOutput={this.props.preferences.textOutput}
                  gridOutput={this.props.preferences.gridOutput}
                  soundOutput={this.props.preferences.soundOutput}
                  setTextOutput={this.props.setTextOutput}
                  setGridOutput={this.props.setGridOutput}
                  setSoundOutput={this.props.setSoundOutput}
                  dispatchConsoleEvent={this.props.dispatchConsoleEvent}
                  autorefresh={this.props.preferences.autorefresh}
                  previewIsRefreshing={this.props.ide.previewIsRefreshing}
                  endSketchRefresh={this.props.endSketchRefresh}
                  stopSketch={this.props.stopSketch}
                  setBlobUrl={this.props.setBlobUrl}
                  expandConsole={this.props.expandConsole}
                />
              </div>
            </SplitPane>
          </SplitPane>
        </div>
        {(() => {
          if (this.props.ide.modalIsVisible) {
            return (
              <NewFileModal
                canUploadMedia={this.props.user.authenticated}
                closeModal={this.props.closeNewFileModal}
                createFile={this.props.createFile}
              />
            );
          }
          return '';
        })()}
        {(() => {
          if (this.props.ide.newFolderModalVisible) {
            return (
              <NewFolderModal
                closeModal={this.props.closeNewFolderModal}
                createFolder={this.props.createFolder}
              />
            );
          }
          return '';
        })()}
        {(() => { // eslint-disable-line
          if (this.props.location.pathname.match(/sketches$/)) {
            return (
              <Overlay>
                <SketchList
                  username={this.props.params.username}
                  previousPath={this.props.ide.previousPath}
                />
              </Overlay>
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (this.props.location.pathname.match('ownerclassroomsettings/')) {
            return (
              <Overlay>
                <ClassroomSettingsForm
                  classroom={this.props.classroom}
                  username={this.props.params.username}
                  previousPath={this.props.ide.previousPath}
                />
              </Overlay>
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (this.props.location.pathname.match('submitsketch')) {
            return (
              <Overlay>
                <SubmitSketch
                  username={this.props.params.username}
                  previousPath={this.props.ide.previousPath}
                />
              </Overlay>
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (this.props.location.pathname.match('/myclassrooms')) {
            return (
              <Overlay>
                <ClassroomList
                  username={this.props.params.username}
                  previousPath={this.props.ide.previousPath}
                />
              </Overlay>
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (this.props.location.pathname.match('/classroom')) {
            return (
              <Overlay>
                <ClassroomView
                  username={this.props.params.username}
                  previousPath={this.props.ide.previousPath}
                />
              </Overlay>
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (this.props.location.pathname === '/about') {
            return (
              <Overlay>
                <About previousPath={this.props.ide.previousPath} />
              </Overlay>
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (this.props.ide.shareModalVisible) {
            return (
              <Overlay>
                <ShareModal
                  projectId={this.props.project.id}
                  closeShareModal={this.props.closeShareModal}
                  ownerUsername={this.props.project.owner.username}
                />
              </Overlay>
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (this.props.ide.keyboardShortcutVisible) {
            return (
              <Overlay>
                <KeyboardShortcutModal
                  closeModal={this.props.closeKeyboardShortcutModal}
                />
              </Overlay>
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (this.props.ide.errorType) {
            return (
              <Overlay>
                <ErrorModal
                  type={this.props.ide.errorType}
                  closeModal={this.props.hideErrorModal}
                />
              </Overlay>
            );
          }
        })()}
        {(() => { // eslint-disable-line
          if (this.props.ide.helpType) {
            return (
              <Overlay>
                <HelpModal
                  type={this.props.ide.helpType}
                  closeModal={this.props.hideHelpModal}
                />
              </Overlay>
            );
          }
        })()}
      </div>

    );
  }
}

IDEView.propTypes = {
  params: PropTypes.shape({
    project_id: PropTypes.string,
    classroom_id: PropTypes.string,
    username: PropTypes.string,
    reset_password_token: PropTypes.string,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string
  }).isRequired,
  getProject: PropTypes.func.isRequired,
  getClassroom: PropTypes.func.isRequired,
  user: PropTypes.shape({
    authenticated: PropTypes.bool.isRequired,
    id: PropTypes.string,
    username: PropTypes.string
  }).isRequired,
  newProject: PropTypes.func.isRequired,
  saveProject: PropTypes.func.isRequired,
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
    editorOptionsVisible: PropTypes.bool.isRequired,
    keyboardShortcutVisible: PropTypes.bool.isRequired,
    unsavedChanges: PropTypes.bool.isRequired,
    infiniteLoop: PropTypes.bool.isRequired,
    previewIsRefreshing: PropTypes.bool.isRequired,
    infiniteLoopMessage: PropTypes.string.isRequired,
    projectSavedTime: PropTypes.string.isRequired,
    previousPath: PropTypes.string.isRequired,
    justOpenedProject: PropTypes.bool.isRequired,
    errorType: PropTypes.string,
    helpType: PropTypes.string
  }).isRequired,
  stopSketch: PropTypes.func.isRequired,
  startAccessibleOutput: PropTypes.func.isRequired,
  stopAccessibleOutput: PropTypes.func.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    serveSecure: PropTypes.bool,
    owner: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.string
    }),
    updatedAt: PropTypes.string
  }).isRequired,
  classroom: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
  }).isRequired,
  setProjectName: PropTypes.func.isRequired,
  setServeSecure: PropTypes.func.isRequired,
  openPreferences: PropTypes.func.isRequired,
  editorAccessibility: PropTypes.shape({
    lintMessages: PropTypes.array.isRequired,
  }).isRequired,
  updateLintMessage: PropTypes.func.isRequired,
  clearLintMessage: PropTypes.func.isRequired,
  preferences: PropTypes.shape({
    fontSize: PropTypes.number.isRequired,
    indentationAmount: PropTypes.number.isRequired,
    isTabIndent: PropTypes.bool.isRequired,
    autosave: PropTypes.bool.isRequired,
    lintWarning: PropTypes.bool.isRequired,
    textOutput: PropTypes.bool.isRequired,
    gridOutput: PropTypes.bool.isRequired,
    soundOutput: PropTypes.bool.isRequired,
    theme: PropTypes.string.isRequired,
    autorefresh: PropTypes.bool.isRequired
  }).isRequired,
  closePreferences: PropTypes.func.isRequired,
  setFontSize: PropTypes.func.isRequired,
  setIndentation: PropTypes.func.isRequired,
  indentWithTab: PropTypes.func.isRequired,
  indentWithSpace: PropTypes.func.isRequired,
  setAutosave: PropTypes.func.isRequired,
  setLintWarning: PropTypes.func.isRequired,
  setTextOutput: PropTypes.func.isRequired,
  setGridOutput: PropTypes.func.isRequired,
  setSoundOutput: PropTypes.func.isRequired,
  files: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
  })).isRequired,
  updateFileContent: PropTypes.func.isRequired,
  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  setSelectedFile: PropTypes.func.isRequired,
  htmlFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
  }).isRequired,
  dispatchConsoleEvent: PropTypes.func.isRequired,
  newFile: PropTypes.func.isRequired,
  closeNewFileModal: PropTypes.func.isRequired,
  expandSidebar: PropTypes.func.isRequired,
  collapseSidebar: PropTypes.func.isRequired,
  exportProjectAsZip: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  expandConsole: PropTypes.func.isRequired,
  collapseConsole: PropTypes.func.isRequired,
  showFileOptions: PropTypes.func.isRequired,
  hideFileOptions: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  showEditFileName: PropTypes.func.isRequired,
  hideEditFileName: PropTypes.func.isRequired,
  updateFileName: PropTypes.func.isRequired,
  showEditProjectName: PropTypes.func.isRequired,
  hideEditProjectName: PropTypes.func.isRequired,
  logoutUser: PropTypes.func.isRequired,
  openProjectOptions: PropTypes.func.isRequired,
  closeProjectOptions: PropTypes.func.isRequired,
  newFolder: PropTypes.func.isRequired,
  closeNewFolderModal: PropTypes.func.isRequired,
  createFolder: PropTypes.func.isRequired,
  createFile: PropTypes.func.isRequired,
  showShareModal: PropTypes.func.isRequired,
  closeShareModal: PropTypes.func.isRequired,
  showEditorOptions: PropTypes.func.isRequired,
  closeEditorOptions: PropTypes.func.isRequired,
  showKeyboardShortcutModal: PropTypes.func.isRequired,
  closeKeyboardShortcutModal: PropTypes.func.isRequired,
  toast: PropTypes.shape({
    isVisible: PropTypes.bool.isRequired
  }).isRequired,
  autosaveProject: PropTypes.func.isRequired,
  router: PropTypes.shape({
    setRouteLeaveHook: PropTypes.func
  }).isRequired,
  route: PropTypes.oneOfType([PropTypes.object, PropTypes.element]).isRequired,
  setUnsavedChanges: PropTypes.func.isRequired,
  setTheme: PropTypes.func.isRequired,
  setAutorefresh: PropTypes.func.isRequired,
  startSketchAndRefresh: PropTypes.func.isRequired,
  endSketchRefresh: PropTypes.func.isRequired,
  startRefreshSketch: PropTypes.func.isRequired,
  setBlobUrl: PropTypes.func.isRequired,
  setPreviousPath: PropTypes.func.isRequired,
  console: PropTypes.arrayOf(PropTypes.shape({
    method: PropTypes.string.isRequired,
    args: PropTypes.arrayOf(PropTypes.string)
  })).isRequired,
  clearConsole: PropTypes.func.isRequired,
  showErrorModal: PropTypes.func.isRequired,
  hideErrorModal: PropTypes.func.isRequired,
  clearPersistedState: PropTypes.func.isRequired,
  persistState: PropTypes.func.isRequired,
  showHelpModal: PropTypes.func.isRequired,
  hideHelpModal: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    files: state.files,
    selectedFile: state.files.find(file => file.isSelectedFile),
    htmlFile: getHTMLFile(state.files),
    ide: state.ide,
    preferences: state.preferences,
    editorAccessibility: state.editorAccessibility,
    user: state.user,
    project: state.project,
    toast: state.toast,
    console: state.console,
    classroom: state.classroom
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({},
    EditorAccessibilityActions,
    FileActions,
    ProjectActions,
    ClassroomActions,
    IDEActions,
    PreferencesActions,
    UserActions,
    ToastActions,
    ConsoleActions),
  dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(IDEView));
