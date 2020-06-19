/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Header from '../../components/mobile/Header';
import PreviewFrame from '../IDE/components/PreviewFrame';
import Screen from '../../components/mobile/MobileScreen';
import * as ProjectActions from '../IDE/actions/project';
import * as IDEActions from '../IDE/actions/ide';
import * as PreferencesActions from '../IDE/actions/preferences';
import * as ConsoleActions from '../IDE/actions/console';
import * as FilesActions from '../IDE/actions/files';

import { getHTMLFile } from '../IDE/reducers/files';


import { ExitIcon } from '../../common/icons';
import { remSize } from '../../theme';


const Content = styled.div`
  z-index: 0;
  margin-top: ${remSize(68)};
`;

const IconLinkWrapper = styled(Link)`
  width: 2rem;
  margin-right: 1.25rem;
  margin-left: none;
`;

const MobileSketchView = (props) => {
  // TODO: useSelector requires react-redux ^7.1.0
  // const htmlFile = useSelector(state => getHTMLFile(state.files));
  // const jsFiles = useSelector(state => getJSFiles(state.files));
  // const cssFiles = useSelector(state => getCSSFiles(state.files));
  // const files = useSelector(state => state.files);

  const {
    htmlFile, files, selectedFile, projectName
  } = props;

  // Actions
  const {
    setTextOutput, setGridOutput, setSoundOutput,
    endSketchRefresh, stopSketch,
    dispatchConsoleEvent, expandConsole, clearConsole,
    setBlobUrl,
  } = props;

  const { preferences, ide } = props;

  // useEffect(() => {
  //   console.log(params);
  //   getProject(params.project_id, params.username);
  // }, []);

  return (
    <Screen>
      <Header>
        <IconLinkWrapper to="/mobile" aria-label="Return to original editor">
          <ExitIcon viewBox="0 0 16 16" />
        </IconLinkWrapper>
        <div>
          <h2>{projectName}</h2>
          <h3><br /></h3>
        </div>
      </Header>
      <Content>
        <PreviewFrame
          htmlFile={htmlFile}
          files={files}
          head={<link type="text/css" rel="stylesheet" href="/preview-styles.css" />}

          content={selectedFile.content}

          isPlaying
          isAccessibleOutputPlaying={ide.isAccessibleOutputPlaying}
          previewIsRefreshing={ide.previewIsRefreshing}

          textOutput={preferences.textOutput}
          gridOutput={preferences.gridOutput}
          soundOutput={preferences.soundOutput}
          autorefresh={preferences.autorefresh}

          setTextOutput={setTextOutput}
          setGridOutput={setGridOutput}
          setSoundOutput={setSoundOutput}
          dispatchConsoleEvent={dispatchConsoleEvent}
          endSketchRefresh={endSketchRefresh}
          stopSketch={stopSketch}
          setBlobUrl={setBlobUrl}
          expandConsole={expandConsole}
          clearConsole={clearConsole}
        />
      </Content>
    </Screen>);
};

MobileSketchView.propTypes = {
  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string
  }).isRequired,

  htmlFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  files: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,

  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,

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

  projectName: PropTypes.func.isRequired,

  setTextOutput: PropTypes.func.isRequired,
  setGridOutput: PropTypes.func.isRequired,
  setSoundOutput: PropTypes.func.isRequired,
  dispatchConsoleEvent: PropTypes.func.isRequired,
  endSketchRefresh: PropTypes.func.isRequired,
  stopSketch: PropTypes.func.isRequired,
  setBlobUrl: PropTypes.func.isRequired,
  expandConsole: PropTypes.func.isRequired,
  clearConsole: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    htmlFile: getHTMLFile(state.files),
    projectName: state.project.name,
    files: state.files,
    ide: state.ide,
    preferences: state.preferences,
    selectedFile: state.files.find(file => file.isSelectedFile) ||
      state.files.find(file => file.name === 'sketch.js') ||
      state.files.find(file => file.name !== 'root'),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...ProjectActions, ...IDEActions, ...PreferencesActions, ...ConsoleActions, ...FilesActions
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileSketchView);
