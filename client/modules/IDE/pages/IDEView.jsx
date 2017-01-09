import React, { PropTypes } from 'react';
import Editor from '../components/Editor';
import Sidebar from '../components/Sidebar';
import PreviewFrame from '../components/PreviewFrame';
import Toolbar from '../components/Toolbar';
import TextOutput from '../components/TextOutput';
import Preferences from '../components/Preferences';
import NewFileModal from '../components/NewFileModal';
import NewFolderModal from '../components/NewFolderModal';
import ShareModal from '../components/ShareModal';
import KeyboardShortcutModal from '../components/KeyboardShortcutModal';
import ForceAuthentication from '../components/ForceAuthentication';
import Nav from '../../../components/Nav';
import Console from '../components/Console';
import Toast from '../components/Toast';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as FileActions from '../actions/files';
import * as IDEActions from '../actions/ide';
import * as ProjectActions from '../actions/project';
import * as EditorAccessibilityActions from '../actions/editorAccessibility';
import * as PreferencesActions from '../actions/preferences';
import * as UserActions from '../../User/actions';
import * as ToastActions from '../actions/toast';
import * as ConsoleActions from '../actions/console';
import { getHTMLFile } from '../reducers/files';
import SplitPane from 'react-split-pane';
import Overlay from '../../App/components/Overlay';
import SketchList from '../components/SketchList';
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
    this.props.stopSketch();
    if (this.props.params.project_id) {
      const id = this.props.params.project_id;
      if (id !== this.props.project.id) {
        this.props.getProject(id);
      }

      // if autosave is on and the user is the owner of the project
      if (this.props.preferences.autosave
        && this.isUserOwner()) {
        this.autosaveInterval = setInterval(this.props.autosaveProject, 30000);
      }
    }

    this.consoleSize = this.props.ide.consoleIsExpanded ? 150 : 29;
    this.sidebarSize = this.props.ide.sidebarIsExpanded ? 160 : 20;
    this.forceUpdate();

    this.isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1;
    document.addEventListener('keydown', this.handleGlobalKeydown, false);

    this.props.router.setRouteLeaveHook(this.props.route, (route) => this.warnIfUnsavedChanges(route));

    window.onbeforeunload = () => this.warnIfUnsavedChanges();

    document.body.className = this.props.preferences.theme;
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
    // if user is the owner of the project
    if (this.isUserOwner()) {
      // if the user turns on autosave
      // or the user saves the project for the first time
      if (!this.autosaveInterval &&
        ((this.props.preferences.autosave && !prevProps.preferences.autosave) ||
        (this.props.project.id && !prevProps.project.id))) {
        this.autosaveInterval = setInterval(this.props.autosaveProject, 30000);
      // if user turns off autosave preference
      } else if (this.autosaveInterval && !this.props.preferences.autosave && prevProps.preferences.autosave) {
        clearInterval(this.autosaveInterval);
        this.autosaveInterval = null;
      }
    }

    if (this.autosaveInterval && !this.props.project.id) {
      clearInterval(this.autosaveInterval);
      this.autosaveInterval = null;
    }

    if (this.props.route.path !== prevProps.route.path) {
      this.props.router.setRouteLeaveHook(this.props.route, (route) => this.warnIfUnsavedChanges(route));
    }
  }

  componentWillUnmount() {
    clearInterval(this.autosaveInterval);
    this.autosaveInterval = null;
    this.consoleSize = undefined;
    this.sidebarSize = undefined;
  }

  isUserOwner() {
    return this.props.project.owner && this.props.project.owner.id === this.props.user.id;
  }

  _handleConsolePaneOnDragFinished() {
    this.consoleSize = this.refs.consolePane.state.draggedSize;
    this.refs.consolePane.setState({
      resized: false,
      draggedSize: undefined,
    });
  }

  _handleSidebarPaneOnDragFinished() {
    this.sidebarSize = this.refs.sidebarPane.state.draggedSize;
    this.refs.sidebarPane.setState({
      resized: false,
      draggedSize: undefined
    });
  }

  handleGlobalKeydown(e) {
    // 83 === s
    if (e.keyCode === 83 && ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))) {
      e.preventDefault();
      e.stopPropagation();
      if (this.isUserOwner() || this.props.user.authenticated && !this.props.project.owner) {
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
      this.props.startSketchAndRefresh();
    } else if (e.keyCode === 50 && ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac)) && e.shiftKey) {
      e.preventDefault();
      this.props.setTextOutput(0);
    } else if (e.keyCode === 49 && ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac)) && e.shiftKey) {
      e.preventDefault();
      if (this.props.preferences.textOutput === 3) {
        this.props.preferences.textOutput = 1;
      } else {
        this.props.preferences.textOutput += 1;
      }
      this.props.setTextOutput(this.props.preferences.textOutput);
    }
  }

  warnIfUnsavedChanges(route) { // eslint-disable-line
    if (route && (route.action === 'PUSH' && (route.pathname === '/login' || route.pathname === '/signup'))) {
      // don't warn
    } else if (route && this.props.location.pathname === '/login' || this.props.location.pathname === '/signup') {
      // don't warn
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
          openForceAuthentication={this.props.openForceAuthentication}
          unsavedChanges={this.props.ide.unsavedChanges}
          warnIfUnsavedChanges={this.warnIfUnsavedChanges}
        />
        <Toolbar
          className="Toolbar"
          isPlaying={this.props.ide.isPlaying}
          startSketch={this.props.startSketch}
          stopSketch={this.props.stopSketch}
          startTextOutput={this.props.startTextOutput}
          stopTextOutput={this.props.stopTextOutput}
          projectName={this.props.project.name}
          setProjectName={this.props.setProjectName}
          showEditProjectName={this.props.showEditProjectName}
          hideEditProjectName={this.props.hideEditProjectName}
          openPreferences={this.props.openPreferences}
          preferencesIsVisible={this.props.ide.preferencesIsVisible}
          setTextOutput={this.props.setTextOutput}
          owner={this.props.project.owner}
          project={this.props.project}
          infiniteLoop={this.props.ide.infiniteLoop}
          autorefresh={this.props.preferences.autorefresh}
          setAutorefresh={this.props.setAutorefresh}
          startSketchAndRefresh={this.props.startSketchAndRefresh}
          saveProject={this.props.saveProject}
          currentUser={this.props.user.username}
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
          setTextOutput={this.props.setTextOutput}
          theme={this.props.preferences.theme}
          setTheme={this.props.setTheme}
        />
        <div className="editor-preview-container">
          <SplitPane
            split="vertical"
            defaultSize={this.sidebarSize}
            ref="sidebarPane"
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
            />
            <SplitPane
              split="vertical"
              defaultSize={'50%'}
              onChange={() => (this.refs.overlay.style.display = 'block')}
              onDragFinished={() => (this.refs.overlay.style.display = 'none')}
            >
              <SplitPane
                split="horizontal"
                primary="second"
                defaultSize={this.consoleSize}
                minSize={29}
                ref="consolePane"
                onDragFinished={this._handleConsolePaneOnDragFinished}
                allowResize={this.props.ide.consoleIsExpanded}
                className="editor-preview-subpanel"
              >
                <Editor
                  lintWarning={this.props.preferences.lintWarning}
                  lintMessages={this.props.editorAccessibility.lintMessages}
                  updateLineNumber={this.props.updateLineNumber}
                  updateLintMessage={this.props.updateLintMessage}
                  clearLintMessage={this.props.clearLintMessage}
                  file={this.props.selectedFile}
                  updateFileContent={this.props.updateFileContent}
                  fontSize={this.props.preferences.fontSize}
                  indentationAmount={this.props.preferences.indentationAmount}
                  isTabIndent={this.props.preferences.isTabIndent}
                  files={this.props.files}
                  lintMessages={this.props.editorAccessibility.lintMessages}
                  lineNumber={this.props.editorAccessibility.lineNumber}
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
                  projectSavedTime={this.props.ide.projectSavedTime}
                  isExpanded={this.props.ide.sidebarIsExpanded}
                  expandSidebar={this.props.expandSidebar}
                  collapseSidebar={this.props.collapseSidebar}
                />
                <Console
                  consoleLines={this.props.console}
                  isPlaying={this.props.ide.isPlaying}
                  isExpanded={this.props.ide.consoleIsExpanded}
                  expandConsole={this.props.expandConsole}
                  collapseConsole={this.props.collapseConsole}
                  stopSketch={this.props.stopSketch}
                />
              </SplitPane>
              <div className="preview-frame-holder">
                <div className="preview-frame-overlay" ref="overlay">
                </div>
                <div>
                {(() => {
                  if ((this.props.preferences.textOutput && this.props.ide.isPlaying) || this.props.ide.isTextOutputPlaying) {
                    return (
                      <TextOutput />
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
                  isTextOutputPlaying={this.props.ide.isTextOutputPlaying}
                  textOutput={this.props.preferences.textOutput}
                  setTextOutput={this.props.setTextOutput}
                  dispatchConsoleEvent={this.props.dispatchConsoleEvent}
                  autorefresh={this.props.preferences.autorefresh}
                  previewIsRefreshing={this.props.ide.previewIsRefreshing}
                  endSketchRefresh={this.props.endSketchRefresh}
                  stopSketch={this.props.stopSketch}
                  setBlobUrl={this.props.setBlobUrl}
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
          if (this.props.ide.forceAuthenticationVisible) {
            return (
              <Overlay>
                <ForceAuthentication
                  closeModal={this.props.closeForceAuthentication}
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
    username: PropTypes.string,
    reset_password_token: PropTypes.string,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string
  }),
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
    isTextOutputPlaying: PropTypes.bool.isRequired,
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
    forceAuthenticationVisible: PropTypes.bool.isRequired
  }).isRequired,
  startSketch: PropTypes.func.isRequired,
  stopSketch: PropTypes.func.isRequired,
  startTextOutput: PropTypes.func.isRequired,
  stopTextOutput: PropTypes.func.isRequired,
  detectInfiniteLoops: PropTypes.func.isRequired,
  resetInfiniteLoops: PropTypes.func.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.string
    })
  }).isRequired,
  setProjectName: PropTypes.func.isRequired,
  openPreferences: PropTypes.func.isRequired,
  editorAccessibility: PropTypes.shape({
    lintMessages: PropTypes.array.isRequired,
    lineNumber: PropTypes.string.isRequired
  }).isRequired,
  updateLintMessage: PropTypes.func.isRequired,
  clearLintMessage: PropTypes.func.isRequired,
  updateLineNumber: PropTypes.func.isRequired,
  preferences: PropTypes.shape({
    fontSize: PropTypes.number.isRequired,
    indentationAmount: PropTypes.number.isRequired,
    isTabIndent: PropTypes.bool.isRequired,
    autosave: PropTypes.bool.isRequired,
    lintWarning: PropTypes.bool.isRequired,
    textOutput: PropTypes.number.isRequired,
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
  files: PropTypes.array.isRequired,
  updateFileContent: PropTypes.func.isRequired,
  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
  }),
  setSelectedFile: PropTypes.func.isRequired,
  htmlFile: PropTypes.object.isRequired,
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
  showToast: PropTypes.func.isRequired,
  setToastText: PropTypes.func.isRequired,
  autosaveProject: PropTypes.func.isRequired,
  router: PropTypes.shape({
    setRouteLeaveHook: PropTypes.func
  }).isRequired,
  route: PropTypes.object.isRequired,
  setUnsavedChanges: PropTypes.func.isRequired,
  setTheme: PropTypes.func.isRequired,
  setAutorefresh: PropTypes.func.isRequired,
  startSketchAndRefresh: PropTypes.func.isRequired,
  endSketchRefresh: PropTypes.func.isRequired,
  startRefreshSketch: PropTypes.func.isRequired,
  setBlobUrl: PropTypes.func.isRequired,
  setPreviousPath: PropTypes.func.isRequired,
  resetProject: PropTypes.func.isRequired,
  closeForceAuthentication: PropTypes.func.isRequired,
  openForceAuthentication: PropTypes.func.isRequired,
  console: PropTypes.array.isRequired
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
