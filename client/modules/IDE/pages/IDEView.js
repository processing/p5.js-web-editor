import React, { PropTypes } from 'react';
import Editor from '../components/Editor';
import EditorAccessibility from '../components/EditorAccessibility';
import Sidebar from '../components/Sidebar';
import PreviewFrame from '../components/PreviewFrame';
import Toolbar from '../components/Toolbar';
import Preferences from '../components/Preferences';
import NewFileModal from '../components/NewFileModal';
import Nav from '../../../components/Nav';
import Console from '../components/Console';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as FileActions from '../actions/files';
import * as IDEActions from '../actions/ide';
import * as ProjectActions from '../actions/project';
import * as EditorAccessibilityActions from '../actions/editorAccessibility';
import * as PreferencesActions from '../actions/preferences';
import { getFile, getHTMLFile, getJSFiles, getCSSFiles, setSelectedFile } from '../reducers/files';

class IDEView extends React.Component {
  componentDidMount() {
    if (this.props.params.project_id) {
      const id = this.props.params.project_id;
      this.props.getProject(id);

      // if autosave is on and the user is the owner of the project
      if (this.props.preferences.autosave
        && this.props.project.owner
        && this.props.project.owner.id === this.props.user.id) {
        this.autosaveInterval = setInterval(this.props.saveProject, 30000);
      }
    }
  }

  componentDidUpdate(prevProps) {
    // if user is the owner of the project
    if (this.props.project.owner && this.props.project.owner.id === this.props.user.id) {
      // if the user turns on autosave
      // or the user saves the project for the first time
      if (!this.autosaveInterval &&
        ((this.props.preferences.autosave && !prevProps.preferences.autosave) ||
        (this.props.project.id && !prevProps.project.id))) {
        this.autosaveInterval = setInterval(this.props.saveProject, 30000);
      // if user turns off autosave preference
      } else if (this.autosaveInterval && !this.props.preferences.autosave && prevProps.preferences.autosave) {
        clearInterval(this.autosaveInterval);
        this.autosaveInterval = null;
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.autosaveInterval);
    this.autosaveInterval = null;
  }

  render() {
    return (
      <div className="ide">
        <Nav
          user={this.props.user}
          createProject={this.props.createProject}
          saveProject={this.props.saveProject}
          exportProjectAsZip={this.props.exportProjectAsZip}
          cloneProject={this.props.cloneProject}
        />
        <Toolbar
          className="Toolbar"
          isPlaying={this.props.ide.isPlaying}
          startSketch={this.props.startSketch}
          stopSketch={this.props.stopSketch}
          projectName={this.props.project.name}
          setProjectName={this.props.setProjectName}
          openPreferences={this.props.openPreferences}
          preferencesIsVisible={this.props.ide.preferencesIsVisible}
          owner={this.props.project.owner}
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
        />
        <div className="editor-preview-container">
          <Sidebar
            files={this.props.files}
            setSelectedFile={this.props.setSelectedFile}
            newFile={this.props.newFile}
            isExpanded={this.props.ide.sidebarIsExpanded}
            expandSidebar={this.props.expandSidebar}
            collapseSidebar={this.props.collapseSidebar}
            showFileOptions={this.props.showFileOptions}
            hideFileOptions={this.props.hideFileOptions}
            deleteFile={this.props.deleteFile}
            showEditFileName={this.props.showEditFileName}
            hideEditFileName={this.props.hideEditFileName}
            updateFileName={this.props.updateFileName}
          />
          <div className="editor-console-container">
            <EditorAccessibility
              toggleBeep={this.props.toggleBeep}
              lintMessages={this.props.editorAccessibility.lintMessages}
              lineNo={this.props.editorAccessibility.lineNo}
            />
            <Editor
              enableBeep={this.props.editorAccessibility.enableBeep}
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
            />
            <Console
              consoleEvent={this.props.ide.consoleEvent}
              isPlaying={this.props.ide.isPlaying}
              isExpanded={this.props.ide.consoleIsExpanded}
              expandConsole={this.props.expandConsole}
              collapseConsole={this.props.collapseConsole}
            />
          </div>
          <PreviewFrame
            htmlFile={this.props.htmlFile}
            jsFiles={this.props.jsFiles}
            cssFiles={this.props.cssFiles}
            files={this.props.files}
            content={this.props.selectedFile.content}
            head={
              <link type="text/css" rel="stylesheet" href="/preview-styles.css" />
            }
            isPlaying={this.props.ide.isPlaying}
            dispatchConsoleEvent={this.props.dispatchConsoleEvent}
          />
        </div>
        {(() => {
          if (this.props.ide.modalIsVisible) {
            return (
              <NewFileModal
                canUploadMedia={this.props.user.authenticated}
                closeModal={this.props.closeNewFileModal}
              />
            );
          }
          return '';
        })()}
      </div>

    );
  }
}

IDEView.propTypes = {
  params: PropTypes.shape({
    project_id: PropTypes.string
  }),
  getProject: PropTypes.func.isRequired,
  user: PropTypes.shape({
    authenticated: PropTypes.bool.isRequired,
    id: PropTypes.string
  }).isRequired,
  createProject: PropTypes.func.isRequired,
  saveProject: PropTypes.func.isRequired,
  ide: PropTypes.shape({
    isPlaying: PropTypes.bool.isRequired,
    consoleEvent: PropTypes.object,
    modalIsVisible: PropTypes.bool.isRequired,
    sidebarIsExpanded: PropTypes.bool.isRequired,
    consoleIsExpanded: PropTypes.bool.isRequired,
    preferencesIsVisible: PropTypes.bool.isRequired
  }).isRequired,
  startSketch: PropTypes.func.isRequired,
  stopSketch: PropTypes.func.isRequired,
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
    enableBeep: PropTypes.bool.isRequired,
    lintMessages: PropTypes.array.isRequired,
    lineNo: PropTypes.number.isRequired
  }).isRequired,
  toggleBeep: PropTypes.func.isRequired,
  updateLintMessage: PropTypes.func.isRequired,
  clearLintMessage: PropTypes.func.isRequired,
  updateLineNumber: PropTypes.func.isRequired,
  preferences: PropTypes.shape({
    fontSize: PropTypes.number.isRequired,
    indentationAmount: PropTypes.number.isRequired,
    isTabIndent: PropTypes.bool.isRequired,
    autosave: PropTypes.bool.isRequired
  }).isRequired,
  closePreferences: PropTypes.func.isRequired,
  setFontSize: PropTypes.func.isRequired,
  setIndentation: PropTypes.func.isRequired,
  indentWithTab: PropTypes.func.isRequired,
  indentWithSpace: PropTypes.func.isRequired,
  setAutosave: PropTypes.func.isRequired,
  files: PropTypes.array.isRequired,
  updateFileContent: PropTypes.func.isRequired,
  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
  }),
  setSelectedFile: PropTypes.func.isRequired,
  htmlFile: PropTypes.object.isRequired,
  jsFiles: PropTypes.array.isRequired,
  cssFiles: PropTypes.array.isRequired,
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
  updateFileName: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    files: setSelectedFile(state.files, state.ide.selectedFile),
    selectedFile: getFile(state.files, state.ide.selectedFile),
    htmlFile: getHTMLFile(state.files),
    jsFiles: getJSFiles(state.files),
    cssFiles: getCSSFiles(state.files),
    ide: state.ide,
    preferences: state.preferences,
    editorAccessibility: state.editorAccessibility,
    user: state.user,
    project: state.project
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({},
    EditorAccessibilityActions,
    FileActions,
    ProjectActions,
    IDEActions,
    PreferencesActions),
  dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(IDEView);
