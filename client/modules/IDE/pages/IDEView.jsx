import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Helmet } from 'react-helmet';
import SplitPane from 'react-split-pane';
import Editor from '../components/Editor';
import Sidebar from '../components/Sidebar';
import PreviewFrame from '../components/PreviewFrame';
import Toolbar from '../components/Toolbar';
import Preferences from '../components/Preferences';
import NewFileModal from '../components/NewFileModal';
import NewFolderModal from '../components/NewFolderModal';
import ShareModal from '../components/ShareModal';
import KeyboardShortcutModal from '../components/KeyboardShortcutModal';
import ErrorModal from '../components/ErrorModal';
import HTTPSModal from '../components/HTTPSModal';
import Nav from '../../../components/Nav';
import Console from '../components/Console';
import Toast from '../components/Toast';
import * as FileActions from '../actions/files';
import * as IDEActions from '../actions/ide';
import * as ProjectActions from '../actions/project';
import * as EditorAccessibilityActions from '../actions/editorAccessibility';
import * as PreferencesActions from '../actions/preferences';
import * as UserActions from '../../User/actions';
import * as ToastActions from '../actions/toast';
import * as ConsoleActions from '../actions/console';
import { getHTMLFile } from '../reducers/files';
import Overlay from '../../App/components/Overlay';
import SketchList from '../components/SketchList';
import AssetList from '../components/AssetList';
import About from '../components/About';
import Feedback from '../components/Feedback';

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

    if (nextProps.preferences.theme !== this.props.preferences.theme) {
      document.body.className = nextProps.preferences.theme;
    }
  }

  componentDidUpdate(prevProps) {
    if (this.isUserOwner() && this.props.project.id) {
      if (this.props.preferences.autosave && this.props.ide.unsavedChanges && !this.props.ide.justOpenedProject) {
        if (
          this.props.selectedFile.name === prevProps.selectedFile.name &&
          this.props.selectedFile.content !== prevProps.selectedFile.content) {
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
      } else if (this.props.user.authenticated) {
        this.props.cloneProject();
      } else {
        this.props.showErrorModal('forceAuthentication');
      }
      // 13 === enter
    } else if (e.keyCode === 13 && e.shiftKey && ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))) {
      e.preventDefault();
      e.stopPropagation();
      this.props.stopSketch();
    } else if (e.keyCode === 13 && ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))) {
      e.preventDefault();
      e.stopPropagation();
      this.props.startSketch();
      // 50 === 2
    } else if (e.keyCode === 50 && ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac)) && e.shiftKey) {
      e.preventDefault();
      this.props.setAllAccessibleOutput(false);
      // 49 === 1
    } else if (e.keyCode === 49 && ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac)) && e.shiftKey) {
      e.preventDefault();
      this.props.setAllAccessibleOutput(true);
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
        <Helmet>
          <title>p5.js Web Editor | {this.props.project.name}</title>
        </Helmet>
        {this.props.toast.isVisible && <Toast />}
        <Nav
          user={this.props.user}
          newProject={this.props.newProject}
          saveProject={this.props.saveProject}
          autosaveProject={this.props.autosaveProject}
          exportProjectAsZip={this.props.exportProjectAsZip}
          cloneProject={this.props.cloneProject}
          project={this.props.project}
          logoutUser={this.props.logoutUser}
          startSketch={this.props.startSketch}
          stopSketch={this.props.stopSketch}
          showShareModal={this.props.showShareModal}
          showErrorModal={this.props.showErrorModal}
          unsavedChanges={this.props.ide.unsavedChanges}
          warnIfUnsavedChanges={this.warnIfUnsavedChanges}
          showKeyboardShortcutModal={this.props.showKeyboardShortcutModal}
          cmController={this.cmController}
          setAllAccessibleOutput={this.props.setAllAccessibleOutput}
        />
        <Toolbar
          className="Toolbar"
          isPlaying={this.props.ide.isPlaying}
          stopSketch={this.props.stopSketch}
          projectName={this.props.project.name}
          setProjectName={this.props.setProjectName}
          showEditProjectName={this.props.showEditProjectName}
          hideEditProjectName={this.props.hideEditProjectName}
          openPreferences={this.props.openPreferences}
          preferencesIsVisible={this.props.ide.preferencesIsVisible}
          setTextOutput={this.props.setTextOutput}
          setGridOutput={this.props.setGridOutput}
          setSoundOutput={this.props.setSoundOutput}
          owner={this.props.project.owner}
          project={this.props.project}
          infiniteLoop={this.props.ide.infiniteLoop}
          autorefresh={this.props.preferences.autorefresh}
          setAutorefresh={this.props.setAutorefresh}
          startSketch={this.props.startSketch}
          startAccessibleSketch={this.props.startAccessibleSketch}
          saveProject={this.props.saveProject}
          currentUser={this.props.user.username}
          showHelpModal={this.props.showHelpModal}
        />
        {this.props.ide.preferencesIsVisible &&
          <Overlay
            title="Settings"
            ariaLabel="settings"
            closeOverlay={this.props.closePreferences}
          >
            <Preferences
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
              soundOutput={this.props.preferences.soundOutput}
              setTextOutput={this.props.setTextOutput}
              setGridOutput={this.props.setGridOutput}
              setSoundOutput={this.props.setSoundOutput}
              theme={this.props.preferences.theme}
              setTheme={this.props.setTheme}
              serveSecure={this.props.project.serveSecure}
              setServeSecure={this.props.setServeSecure}
            />
          </Overlay>
        }
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
              onChange={() => { this.overlay.style.display = 'block'; }}
              onDragFinished={() => { this.overlay.style.display = 'none'; }}
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
                  consoleEvents={this.props.console}
                  showRuntimeErrorWarning={this.props.showRuntimeErrorWarning}
                  hideRuntimeErrorWarning={this.props.hideRuntimeErrorWarning}
                  runtimeErrorWarningVisible={this.props.ide.runtimeErrorWarningVisible}
                  provideController={(ctl) => { this.cmController = ctl; }}
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
                  {(
                      (
                        (this.props.preferences.textOutput ||
                          this.props.preferences.gridOutput ||
                          this.props.preferences.soundOutput
                        ) &&
                          this.props.ide.isPlaying
                      ) ||
                      this.props.ide.isAccessibleOutputPlaying
                    )
                  }
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
        { this.props.ide.modalIsVisible &&
          <NewFileModal
            canUploadMedia={this.props.user.authenticated}
            closeModal={this.props.closeNewFileModal}
            createFile={this.props.createFile}
          />
        }
        { this.props.ide.newFolderModalVisible &&
          <NewFolderModal
            closeModal={this.props.closeNewFolderModal}
            createFolder={this.props.createFolder}
          />
        }
        { this.props.location.pathname.match(/sketches$/) &&
          <Overlay
            ariaLabel="project list"
            title="Open a Sketch"
            previousPath={this.props.ide.previousPath}
          >
            <SketchList
              username={this.props.params.username}
              user={this.props.user}
            />
          </Overlay>
        }
        { this.props.location.pathname.match(/assets$/) &&
          <Overlay
            title="Assets"
            ariaLabel="asset list"
            previousPath={this.props.ide.previousPath}
          >
            <AssetList
              username={this.props.params.username}
              user={this.props.user}
            />
          </Overlay>
        }
        { this.props.location.pathname === '/about' &&
          <Overlay
            previousPath={this.props.ide.previousPath}
            title="Welcome"
            ariaLabel="about"
          >
            <About previousPath={this.props.ide.previousPath} />
          </Overlay>
        }
        { this.props.location.pathname === '/feedback' &&
          <Overlay
            previousPath={this.props.ide.previousPath}
            title="Submit Feedback"
            ariaLabel="submit-feedback"
          >
            <Feedback previousPath={this.props.ide.previousPath} />
          </Overlay>
        }
        { this.props.ide.shareModalVisible &&
          <Overlay
            title="Share This Sketch"
            ariaLabel="share"
            closeOverlay={this.props.closeShareModal}
          >
            <ShareModal
              projectId={this.props.project.id}
              projectName={this.props.project.name}
              ownerUsername={this.props.project.owner.username}
            />
          </Overlay>
        }
        { this.props.ide.keyboardShortcutVisible &&
          <Overlay
            title="Keyboard Shortcuts"
            ariaLabel="keyboard shortcuts"
            closeOverlay={this.props.closeKeyboardShortcutModal}
          >
            <KeyboardShortcutModal />
          </Overlay>
        }
        { this.props.ide.errorType &&
          <Overlay
            title="Error"
            ariaLabel="error"
          >
            <ErrorModal
              type={this.props.ide.errorType}
              closeModal={this.props.hideErrorModal}
            />
          </Overlay>
        }
        { this.props.ide.helpType &&
          <Overlay
            title="Serve over HTTPS"
            closeOverlay={this.props.hideHelpModal}
          >
            <HTTPSModal />
          </Overlay>
        }
      </div>
    );
  }
}

IDEView.propTypes = {
  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string,
    reset_password_token: PropTypes.string,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string
  }).isRequired,
  getProject: PropTypes.func.isRequired,
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
    projectSavedTime: PropTypes.string,
    previousPath: PropTypes.string.isRequired,
    justOpenedProject: PropTypes.bool.isRequired,
    errorType: PropTypes.string,
    helpType: PropTypes.string,
    runtimeErrorWarningVisible: PropTypes.bool.isRequired,
  }).isRequired,
  stopSketch: PropTypes.func.isRequired,
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
  setAllAccessibleOutput: PropTypes.func.isRequired,
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
  hideHelpModal: PropTypes.func.isRequired,
  showRuntimeErrorWarning: PropTypes.func.isRequired,
  hideRuntimeErrorWarning: PropTypes.func.isRequired,
  startSketch: PropTypes.func.isRequired,
  startAccessibleSketch: PropTypes.func.isRequired
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
    console: state.console
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({},
    EditorAccessibilityActions,
    FileActions,
    ProjectActions,
    IDEActions,
    PreferencesActions,
    UserActions,
    ToastActions,
    ConsoleActions),
  dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(IDEView));
