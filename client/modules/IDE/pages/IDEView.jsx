import PropTypes from 'prop-types';
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import SplitPane from 'react-split-pane';
import Editor from '../components/Editor';
import Sidebar from '../components/Sidebar';
import PreviewFrame from '../components/PreviewFrame';
import Toolbar from '../components/Toolbar';
import Preferences from '../components/Preferences/index';
import NewFileModal from '../components/NewFileModal';
import NewFolderModal from '../components/NewFolderModal';
import UploadFileModal from '../components/UploadFileModal';
import ShareModal from '../components/ShareModal';
import KeyboardShortcutModal from '../components/KeyboardShortcutModal';
import ErrorModal from '../components/ErrorModal';
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
import About from '../components/About';
import AddToCollectionList from '../components/AddToCollectionList';
import Feedback from '../components/Feedback';
import { CollectionSearchbar } from '../components/Searchbar';
import MessageHandler from '../components/MessageHandler';


function getTitle(props) {
  const { id } = props.project;
  return id ? `p5.js Web Editor | ${props.project.name}` : 'p5.js Web Editor';
}

function isUserOwner(props) {
  return props.project.owner && props.project.owner.id === props.user.id;
}

function warnIfUnsavedChanges(props) {
  // eslint-disable-line
  const { route } = props.route;
  if (
    route &&
    route.action === 'PUSH' &&
      (route.pathname === '/login' || route.pathname === '/signup')
  ) {
    // don't warn
    props.persistState();
    window.onbeforeunload = null;
  } else if (
    route &&
    (props.location.pathname === '/login' ||
      props.location.pathname === '/signup')
  ) {
    // don't warn
    props.persistState();
    window.onbeforeunload = null;
  } else if (props.ide.unsavedChanges) {
    if (!window.confirm(props.t('Nav.WarningUnsavedChanges'))) {
      return false;
    }
    props.setUnsavedChanges(false);
    return true;
  }
  return true;
}

class IDEView extends React.Component {
  constructor(props) {
    super(props);
    this.handleGlobalKeydown = this.handleGlobalKeydown.bind(this);

    this.state = {
      consoleSize: props.ide.consoleIsExpanded ? 150 : 29,
      sidebarSize: props.ide.sidebarIsExpanded ? 160 : 20,
    };

    this.previewFrame = React.createRef();
  }

  componentDidMount() {
    // If page doesn't reload after Sign In then we need
    // to force cleared state to be cleared
    this.props.clearPersistedState();

    this.props.stopSketch();
    if (this.props.params.project_id) {
      const { project_id: id, username } = this.props.params;
      if (id !== this.props.project.id) {
        this.props.getProject(id, username);
      }
    }

    this.isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1;
    document.addEventListener('keydown', this.handleGlobalKeydown, false);

    this.props.router.setRouteLeaveHook(
      this.props.route,
      this.handleUnsavedChanges
    );

    window.onbeforeunload = this.handleUnsavedChanges;

    this.autosaveInterval = null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.props.setPreviousPath(this.props.location.pathname);
    }

    if (this.props.ide.consoleIsExpanded !== nextProps.ide.consoleIsExpanded) {
      this.setState({
        consoleSize: nextProps.ide.consoleIsExpanded ? 150 : 29,
      });
    }

    if (this.props.ide.sidebarIsExpanded !== nextProps.ide.sidebarIsExpanded) {
      this.setState({
        sidebarSize: nextProps.ide.sidebarIsExpanded ? 160 : 20,
      });
    }
  }

  componentWillUpdate(nextProps) {
    if (nextProps.params.project_id && !this.props.params.project_id) {
      if (nextProps.params.project_id !== nextProps.project.id) {
        this.props.getProject(nextProps.params.project_id);
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (isUserOwner(this.props) && this.props.project.id) {
      if (
        this.props.preferences.autosave &&
        this.props.ide.unsavedChanges &&
        !this.props.ide.justOpenedProject
      ) {
        if (
          this.props.selectedFile.name === prevProps.selectedFile.name &&
          this.props.selectedFile.content !== prevProps.selectedFile.content
        ) {
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
      this.props.router.setRouteLeaveHook(this.props.route, () =>
        warnIfUnsavedChanges(this.props));
    }
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleGlobalKeydown, false);
    clearTimeout(this.autosaveInterval);
    this.autosaveInterval = null;
  }
  handleGlobalKeydown(e) {
    // 83 === s
    if (
      e.keyCode === 83 &&
      ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))
    ) {
      e.preventDefault();
      e.stopPropagation();
      if (
        isUserOwner(this.props) ||
        (this.props.user.authenticated && !this.props.project.owner)
      ) {
        this.props.saveProject(this.cmController.getContent());
      } else if (this.props.user.authenticated) {
        this.props.cloneProject();
      } else {
        this.props.showErrorModal('forceAuthentication');
      }
      // 13 === enter
    } else if (
      e.keyCode === 13 &&
      e.shiftKey &&
      ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))
    ) {
      e.preventDefault();
      e.stopPropagation();
      this.props.stopSketch();
    } else if (
      e.keyCode === 13 &&
      ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))
    ) {
      e.preventDefault();
      e.stopPropagation();
      this.props.startSketch();
      // 50 === 2
    } else if (
      e.keyCode === 50 &&
      ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac)) &&
      e.shiftKey
    ) {
      e.preventDefault();
      this.props.setAllAccessibleOutput(false);
      // 49 === 1
    } else if (
      e.keyCode === 49 &&
      ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac)) &&
      e.shiftKey
    ) {
      e.preventDefault();
      this.props.setAllAccessibleOutput(true);
    } else if (
      e.keyCode === 66 &&
      ((e.metaKey && this.isMac) || (e.ctrlKey && !this.isMac))
    ) {
      e.preventDefault();
      if (!this.props.ide.sidebarIsExpanded) {
        this.props.expandSidebar();
      } else {
        this.props.collapseSidebar();
      }
    } else if (e.keyCode === 192 && e.ctrlKey) {
      e.preventDefault();
      if (this.props.ide.consoleIsExpanded) {
        this.props.collapseConsole();
      } else {
        this.props.expandConsole();
      }
    } else if (e.keyCode === 27) {
      if (this.props.ide.newFolderModalVisible) {
        this.props.closeNewFolderModal();
      } else if (this.props.ide.uploadFileModalVisible) {
        this.props.closeUploadFileModal();
      } else if (this.props.ide.modalIsVisible) {
        this.props.closeNewFileModal();
      }
    }
  }

  handleUnsavedChanges = () => warnIfUnsavedChanges(this.props);

  render() {
    return (
      <div className="ide">
        <Helmet>
          <title>{getTitle(this.props)}</title>
        </Helmet>
        <MessageHandler />
        {this.props.toast.isVisible && <Toast />}
        <Nav
          warnIfUnsavedChanges={this.handleUnsavedChanges}
          cmController={this.cmController}
        />
        <Toolbar key={this.props.project.id} />
        {this.props.ide.preferencesIsVisible && (
          <Overlay
            title={this.props.t('Preferences.Settings')}
            ariaLabel={this.props.t('Preferences.Settings')}
            closeOverlay={this.props.closePreferences}
          >
            <Preferences
              fontSize={this.props.preferences.fontSize}
              setFontSize={this.props.setFontSize}
              autosave={this.props.preferences.autosave}
              linewrap={this.props.preferences.linewrap}
              lineNumbers={this.props.preferences.lineNumbers}
              setLineNumbers={this.props.setLineNumbers}
              setAutosave={this.props.setAutosave}
              setLinewrap={this.props.setLinewrap}
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
            />
          </Overlay>
        )}
        <main className="editor-preview-container">
          <SplitPane
            split="vertical"
            size={this.state.sidebarSize}
            onChange={size => this.setState({ sidebarSize: size })}
            onDragFinished={this._handleSidebarPaneOnDragFinished}
            allowResize={this.props.ide.sidebarIsExpanded}
            minSize={125}
          >
            <Sidebar
              files={this.props.files}
              setSelectedFile={this.props.setSelectedFile}
              newFile={this.props.newFile}
              isExpanded={this.props.ide.sidebarIsExpanded}
              deleteFile={this.props.deleteFile}
              updateFileName={this.props.updateFileName}
              projectOptionsVisible={this.props.ide.projectOptionsVisible}
              openProjectOptions={this.props.openProjectOptions}
              closeProjectOptions={this.props.closeProjectOptions}
              newFolder={this.props.newFolder}
              user={this.props.user}
              owner={this.props.project.owner}
              openUploadFileModal={this.props.openUploadFileModal}
              closeUploadFileModal={this.props.closeUploadFileModal}
            />
            <SplitPane
              split="vertical"
              defaultSize="50%"
              onChange={() => {
                this.overlay.style.display = 'block';
              }}
              onDragFinished={() => {
                this.overlay.style.display = 'none';
              }}
              resizerStyle={{
                borderLeftWidth: '2px',
                borderRightWidth: '2px',
                width: '2px',
                margin: '0px 0px',
              }}
            >
              <SplitPane
                split="horizontal"
                primary="second"
                size={this.state.consoleSize}
                minSize={29}
                onChange={size => this.setState({ consoleSize: size })}
                allowResize={this.props.ide.consoleIsExpanded}
                className="editor-preview-subpanel"
              >
                <Editor provideController={(ctl) => { this.cmController = ctl; }} />
                <Console
                  previewFrame={this.previewFrame.current}
                />
              </SplitPane>
              <section className="preview-frame-holder">
                <header className="preview-frame__header">
                  <h2 className="preview-frame__title">{this.props.t('Toolbar.Preview')}</h2>
                </header>
                <div className="preview-frame__content">
                  <div
                    className="preview-frame-overlay"
                    ref={(element) => {
                      this.overlay = element;
                    }}
                  >
                  </div>
                  <div>
                    {((this.props.preferences.textOutput ||
                      this.props.preferences.gridOutput ||
                      this.props.preferences.soundOutput) &&
                      this.props.ide.isPlaying) ||
                      this.props.ide.isAccessibleOutputPlaying}
                  </div>
                  <PreviewFrame
                    htmlFile={this.props.htmlFile}
                    files={this.props.files}
                    content={this.props.selectedFile.content}
                    isPlaying={this.props.ide.isPlaying}
                    isAccessibleOutputPlaying={
                      this.props.ide.isAccessibleOutputPlaying
                    }
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
                    clearConsole={this.props.clearConsole}
                    cmController={this.cmController}
                    language={this.props.preferences.language}
                    ref={this.previewFrame}
                  />
                </div>
              </section>
            </SplitPane>
          </SplitPane>
        </main>
        {this.props.ide.modalIsVisible && <NewFileModal />}
        {this.props.ide.newFolderModalVisible && (
          <NewFolderModal
            closeModal={this.props.closeNewFolderModal}
            createFolder={this.props.createFolder}
          />
        )}
        {this.props.ide.uploadFileModalVisible && (
          <UploadFileModal closeModal={this.props.closeUploadFileModal} />
        )}
        {this.props.location.pathname === '/about' && (
          <Overlay
            title={this.props.t('About.Title')}
            previousPath={this.props.ide.previousPath}
            ariaLabel={this.props.t('About.Title')}
          >
            <About previousPath={this.props.ide.previousPath} />
          </Overlay>
        )}
        {this.props.location.pathname === '/feedback' && (
          <Overlay
            title={this.props.t('IDEView.SubmitFeedback')}
            previousPath={this.props.ide.previousPath}
            ariaLabel={this.props.t('IDEView.SubmitFeedbackARIA')}
          >
            <Feedback previousPath={this.props.ide.previousPath} />
          </Overlay>
        )}
        {this.props.location.pathname.match(/add-to-collection$/) && (
          <Overlay
            ariaLabel={this.props.t('IDEView.AddCollectionARIA')}
            title={this.props.t('IDEView.AddCollectionTitle')}
            previousPath={this.props.ide.previousPath}
            actions={<CollectionSearchbar />}
            isFixedHeight
          >
            <AddToCollectionList
              projectId={this.props.params.project_id}
              username={this.props.params.username}
              user={this.props.user}
            />
          </Overlay>
        )}
        {this.props.ide.shareModalVisible && (
          <Overlay
            title={this.props.t('IDEView.ShareTitle')}
            ariaLabel={this.props.t('IDEView.ShareARIA')}
            closeOverlay={this.props.closeShareModal}
          >
            <ShareModal
              projectId={this.props.ide.shareModalProjectId}
              projectName={this.props.ide.shareModalProjectName}
              ownerUsername={this.props.ide.shareModalProjectUsername}
            />
          </Overlay>
        )}
        {this.props.ide.keyboardShortcutVisible && (
          <Overlay
            title={this.props.t('KeyboardShortcuts.Title')}
            ariaLabel={this.props.t('KeyboardShortcuts.Title')}
            closeOverlay={this.props.closeKeyboardShortcutModal}
          >
            <KeyboardShortcutModal />
          </Overlay>
        )}
        {this.props.ide.errorType && (
          <Overlay
            title={this.props.t('Common.Error')}
            ariaLabel={this.props.t('Common.ErrorARIA')}
            closeOverlay={this.props.hideErrorModal}
          >
            <ErrorModal
              type={this.props.ide.errorType}
              closeModal={this.props.hideErrorModal}
            />
          </Overlay>
        )}
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
    pathname: PropTypes.string,
  }).isRequired,
  getProject: PropTypes.func.isRequired,
  user: PropTypes.shape({
    authenticated: PropTypes.bool.isRequired,
    id: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  saveProject: PropTypes.func.isRequired,
  ide: PropTypes.shape({
    errorType: PropTypes.string,
    keyboardShortcutVisible: PropTypes.bool.isRequired,
    shareModalVisible: PropTypes.bool.isRequired,
    shareModalProjectId: PropTypes.string.isRequired,
    shareModalProjectName: PropTypes.string.isRequired,
    shareModalProjectUsername: PropTypes.string.isRequired,
    previousPath: PropTypes.string.isRequired,
    previewIsRefreshing: PropTypes.bool.isRequired,
    isPlaying: PropTypes.bool.isRequired,
    isAccessibleOutputPlaying: PropTypes.bool.isRequired,
    projectOptionsVisible: PropTypes.bool.isRequired,
    preferencesIsVisible: PropTypes.bool.isRequired,
    modalIsVisible: PropTypes.bool.isRequired,
    uploadFileModalVisible: PropTypes.bool.isRequired,
    newFolderModalVisible: PropTypes.bool.isRequired,
    justOpenedProject: PropTypes.bool.isRequired,
    sidebarIsExpanded: PropTypes.bool.isRequired,
    consoleIsExpanded: PropTypes.bool.isRequired,
    unsavedChanges: PropTypes.bool.isRequired,
  }).isRequired,
  stopSketch: PropTypes.func.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.string,
    }),
    updatedAt: PropTypes.string,
  }).isRequired,
  editorAccessibility: PropTypes.shape({
    lintMessages: PropTypes.array.isRequired, // eslint-disable-line
  }).isRequired,
  preferences: PropTypes.shape({
    autosave: PropTypes.bool.isRequired,
    fontSize: PropTypes.number.isRequired,
    linewrap: PropTypes.bool.isRequired,
    lineNumbers: PropTypes.bool.isRequired,
    lintWarning: PropTypes.bool.isRequired,
    textOutput: PropTypes.bool.isRequired,
    gridOutput: PropTypes.bool.isRequired,
    soundOutput: PropTypes.bool.isRequired,
    theme: PropTypes.string.isRequired,
    autorefresh: PropTypes.bool.isRequired,
    language: PropTypes.string.isRequired
  }).isRequired,
  closePreferences: PropTypes.func.isRequired,
  setFontSize: PropTypes.func.isRequired,
  setAutosave: PropTypes.func.isRequired,
  setLineNumbers: PropTypes.func.isRequired,
  setLinewrap: PropTypes.func.isRequired,
  setLintWarning: PropTypes.func.isRequired,
  setTextOutput: PropTypes.func.isRequired,
  setGridOutput: PropTypes.func.isRequired,
  setSoundOutput: PropTypes.func.isRequired,
  setAllAccessibleOutput: PropTypes.func.isRequired,
  files: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  })).isRequired,
  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  setSelectedFile: PropTypes.func.isRequired,
  htmlFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
  dispatchConsoleEvent: PropTypes.func.isRequired,
  newFile: PropTypes.func.isRequired,
  expandSidebar: PropTypes.func.isRequired,
  collapseSidebar: PropTypes.func.isRequired,
  cloneProject: PropTypes.func.isRequired,
  expandConsole: PropTypes.func.isRequired,
  collapseConsole: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  updateFileName: PropTypes.func.isRequired,
  openProjectOptions: PropTypes.func.isRequired,
  closeProjectOptions: PropTypes.func.isRequired,
  newFolder: PropTypes.func.isRequired,
  closeNewFolderModal: PropTypes.func.isRequired,
  closeNewFileModal: PropTypes.func.isRequired,
  createFolder: PropTypes.func.isRequired,
  closeShareModal: PropTypes.func.isRequired,
  closeKeyboardShortcutModal: PropTypes.func.isRequired,
  toast: PropTypes.shape({
    isVisible: PropTypes.bool.isRequired,
  }).isRequired,
  autosaveProject: PropTypes.func.isRequired,
  router: PropTypes.shape({
    setRouteLeaveHook: PropTypes.func,
  }).isRequired,
  route: PropTypes.oneOfType([PropTypes.object, PropTypes.element]).isRequired,
  setTheme: PropTypes.func.isRequired,
  endSketchRefresh: PropTypes.func.isRequired,
  setBlobUrl: PropTypes.func.isRequired,
  setPreviousPath: PropTypes.func.isRequired,
  clearConsole: PropTypes.func.isRequired,
  showErrorModal: PropTypes.func.isRequired,
  hideErrorModal: PropTypes.func.isRequired,
  clearPersistedState: PropTypes.func.isRequired,
  startSketch: PropTypes.func.isRequired,
  openUploadFileModal: PropTypes.func.isRequired,
  closeUploadFileModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
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


export default withTranslation()(withRouter(connect(mapStateToProps, mapDispatchToProps)(IDEView)));
