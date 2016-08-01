import React, { PropTypes } from 'react';
import Editor from '../components/Editor';
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
import { getFile, getHTMLFile, getJSFiles, getCSSFiles } from '../reducers/files';

class IDEView extends React.Component {
  componentDidMount() {
    if (this.props.params.project_id) {
      const id = this.props.params.project_id;
      this.props.getProject(id);
    }
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
        />
        <div className="editor-preview-container">
          <Sidebar
            files={this.props.files}
            selectedFile={this.props.selectedFile}
            setSelectedFile={this.props.setSelectedFile}
            newFile={this.props.newFile}
            isExpanded={this.props.ide.sidebarIsExpanded}
            expandSidebar={this.props.expandSidebar}
            collapseSidebar={this.props.collapseSidebar}
          />
          <div className="editor-console-container">
            <Editor
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
    authenticated: PropTypes.bool.isRequired
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
    name: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      username: PropTypes.string
    })
  }).isRequired,
  setProjectName: PropTypes.func.isRequired,
  openPreferences: PropTypes.func.isRequired,
  preferences: PropTypes.shape({
    fontSize: PropTypes.number.isRequired,
    indentationAmount: PropTypes.number.isRequired,
    isTabIndent: PropTypes.bool.isRequired
  }).isRequired,
  closePreferences: PropTypes.func.isRequired,
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
};

function mapStateToProps(state) {
  return {
    files: state.files,
    selectedFile: getFile(state.files, state.ide.selectedFile),
    htmlFile: getHTMLFile(state.files),
    jsFiles: getJSFiles(state.files),
    cssFiles: getCSSFiles(state.files),
    ide: state.ide,
    preferences: state.preferences,
    user: state.user,
    project: state.project
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({},
    FileActions,
    ProjectActions,
    IDEActions),
  dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(IDEView);
