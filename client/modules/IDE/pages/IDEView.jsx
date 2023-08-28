import PropTypes from 'prop-types';
import React from 'react';
import { useLocation, Prompt } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';
import { useTranslation, withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import SplitPane from 'react-split-pane';
import Editor from '../components/Editor';
import IDEKeyHandlers from '../components/IDEKeyHandlers';
import Sidebar from '../components/Sidebar';
import PreviewFrame from '../components/PreviewFrame';
import Preferences from '../components/Preferences/index';
import NewFileModal from '../components/NewFileModal';
import NewFolderModal from '../components/NewFolderModal';
import UploadFileModal from '../components/UploadFileModal';
import ShareModal from '../components/ShareModal';
import KeyboardShortcutModal from '../components/KeyboardShortcutModal';
import ErrorModal from '../components/ErrorModal';
import Console from '../components/Console';
import Toast from '../components/Toast';
import * as FileActions from '../actions/files';
import * as IDEActions from '../actions/ide';
import * as ProjectActions from '../actions/project';
import * as EditorAccessibilityActions from '../actions/editorAccessibility';
import * as PreferencesActions from '../actions/preferences';
import * as UserActions from '../../User/actions';
import * as ConsoleActions from '../actions/console';
import { getHTMLFile } from '../reducers/files';
import Overlay from '../../App/components/Overlay';
import About from '../components/About';
import AddToCollectionList from '../components/AddToCollectionList';
import Feedback from '../components/Feedback';
import { CollectionSearchbar } from '../components/Searchbar';
import { selectActiveFile } from '../selectors/files';
import { getIsUserOwner } from '../selectors/users';
import RootPage from '../../../components/RootPage';
import Header from '../components/Header';

function getTitle(props) {
  const { id } = props.project;
  return id ? `p5.js Web Editor | ${props.project.name}` : 'p5.js Web Editor';
}

function isAuth(pathname) {
  return pathname === '/login' || pathname === '/signup';
}

function isOverlay(pathname) {
  return pathname === '/about' || pathname === '/feedback';
}

function WarnIfUnsavedChanges() {
  const hasUnsavedChanges = useSelector((state) => state.ide.unsavedChanges);

  const { t } = useTranslation();

  const currentLocation = useLocation();

  return (
    <Prompt
      when={hasUnsavedChanges}
      message={(nextLocation) => {
        if (
          isAuth(nextLocation.pathname) ||
          isAuth(currentLocation.pathname) ||
          isOverlay(nextLocation.pathname) ||
          isOverlay(currentLocation.pathname)
        ) {
          return true; // allow navigation
        }
        return t('Nav.WarningUnsavedChanges');
      }}
    />
  );
}

export const CmControllerContext = React.createContext({});

class IDEView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      consoleSize: props.ide.consoleIsExpanded ? 150 : 29,
      sidebarSize: props.ide.sidebarIsExpanded ? 160 : 20
    };
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

    // window.onbeforeunload = this.handleUnsavedChanges;
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    this.autosaveInterval = null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.props.setPreviousPath(this.props.location.pathname);
    }
    if (this.props.ide.sidebarIsExpanded !== nextProps.ide.sidebarIsExpanded) {
      this.setState({
        sidebarSize: nextProps.ide.sidebarIsExpanded ? 160 : 20
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
    if (this.props.isUserOwner && this.props.project.id) {
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
  }
  componentWillUnmount() {
    clearTimeout(this.autosaveInterval);
    this.autosaveInterval = null;
  }

  handleBeforeUnload = (e) => {
    const confirmationMessage = this.props.t('Nav.WarningUnsavedChanges');
    if (this.props.ide.unsavedChanges) {
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    }
    return null;
  };

  syncFileContent = () => {
    const file = this.cmController.getContent();
    this.props.updateFileContent(file.id, file.content);
  };

  render() {
    return (
      <RootPage>
        <Helmet>
          <title>{getTitle(this.props)}</title>
        </Helmet>
        <IDEKeyHandlers getContent={() => this.cmController.getContent()} />
        <WarnIfUnsavedChanges currentLocation={this.props.location} />
        <Toast />
        <CmControllerContext.Provider value={{ current: this.cmController }}>
          <Header
            syncFileContent={this.syncFileContent}
            key={this.props.project.id}
          />
        </CmControllerContext.Provider>
        {this.props.ide.preferencesIsVisible && (
          <Overlay
            title={this.props.t('Preferences.Settings')}
            ariaLabel={this.props.t('Preferences.Settings')}
            closeOverlay={this.props.closePreferences}
          >
            <Preferences />
          </Overlay>
        )}
        <main className="editor-preview-container">
          <SplitPane
            split="vertical"
            size={this.state.sidebarSize}
            onChange={(size) => this.setState({ sidebarSize: size })}
            onDragFinished={this._handleSidebarPaneOnDragFinished}
            allowResize={this.props.ide.sidebarIsExpanded}
            minSize={125}
          >
            <Sidebar />
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
                margin: '0px 0px'
              }}
            >
              <SplitPane
                split="horizontal"
                primary="second"
                size={
                  this.props.ide.consoleIsExpanded ? this.state.consoleSize : 29
                }
                minSize={29}
                onChange={(size) => this.setState({ consoleSize: size })}
                allowResize={this.props.ide.consoleIsExpanded}
                className="editor-preview-subpanel"
              >
                <Editor
                  provideController={(ctl) => {
                    this.cmController = ctl;
                  }}
                />
                <Console />
              </SplitPane>
              <section className="preview-frame-holder">
                <header className="preview-frame__header">
                  <h2 className="preview-frame__title">
                    {this.props.t('Toolbar.Preview')}
                  </h2>
                </header>
                <div className="preview-frame__content">
                  <div
                    className="preview-frame-overlay"
                    ref={(element) => {
                      this.overlay = element;
                    }}
                  />
                  <div>
                    {((this.props.preferences.textOutput ||
                      this.props.preferences.gridOutput) &&
                      this.props.ide.isPlaying) ||
                      this.props.ide.isAccessibleOutputPlaying}
                  </div>
                  <PreviewFrame cmController={this.cmController} />
                </div>
              </section>
            </SplitPane>
          </SplitPane>
        </main>
        {this.props.ide.modalIsVisible && <NewFileModal />}
        {this.props.ide.newFolderModalVisible && <NewFolderModal />}
        {this.props.ide.uploadFileModalVisible && <UploadFileModal />}
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
            <Feedback />
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
      </RootPage>
    );
  }
}

IDEView.propTypes = {
  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string,
    reset_password_token: PropTypes.string
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
    unsavedChanges: PropTypes.bool.isRequired
  }).isRequired,
  stopSketch: PropTypes.func.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.string
    }),
    updatedAt: PropTypes.string
  }).isRequired,
  preferences: PropTypes.shape({
    autosave: PropTypes.bool.isRequired,
    fontSize: PropTypes.number.isRequired,
    linewrap: PropTypes.bool.isRequired,
    lineNumbers: PropTypes.bool.isRequired,
    lintWarning: PropTypes.bool.isRequired,
    textOutput: PropTypes.bool.isRequired,
    gridOutput: PropTypes.bool.isRequired,
    theme: PropTypes.string.isRequired,
    autorefresh: PropTypes.bool.isRequired,
    language: PropTypes.string.isRequired,
    autocloseBracketsQuotes: PropTypes.bool.isRequired,
    autocompleteHinter: PropTypes.bool.isRequired
  }).isRequired,
  closePreferences: PropTypes.func.isRequired,
  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  htmlFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
  }).isRequired,
  updateFileContent: PropTypes.func.isRequired,
  closeShareModal: PropTypes.func.isRequired,
  closeKeyboardShortcutModal: PropTypes.func.isRequired,
  autosaveProject: PropTypes.func.isRequired,
  setPreviousPath: PropTypes.func.isRequired,
  hideErrorModal: PropTypes.func.isRequired,
  clearPersistedState: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  isUserOwner: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
  return {
    selectedFile: selectActiveFile(state),
    htmlFile: getHTMLFile(state.files),
    ide: state.ide,
    preferences: state.preferences,
    editorAccessibility: state.editorAccessibility,
    user: state.user,
    project: state.project,
    console: state.console,
    isUserOwner: getIsUserOwner(state)
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
      ConsoleActions
    ),
    dispatch
  );
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(IDEView)
);
