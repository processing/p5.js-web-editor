import React from 'react';
import { bindActionCreators } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import Header from '../../components/mobile/Header';
import IconButton from '../../components/mobile/IconButton';
import PreviewFrame from '../IDE/components/PreviewFrame';
import Screen from '../../components/mobile/MobileScreen';
import Console from '../IDE/components/Console';
import * as ProjectActions from '../IDE/actions/project';
import * as IDEActions from '../IDE/actions/ide';
import * as PreferencesActions from '../IDE/actions/preferences';
import * as ConsoleActions from '../IDE/actions/console';
import * as FilesActions from '../IDE/actions/files';

import { getHTMLFile } from '../IDE/reducers/files';

import { ExitIcon } from '../../common/icons';
import { remSize } from '../../theme';
import Footer from '../../components/mobile/Footer';
import Content from './MobileViewContent';

const MobileSketchView = () => {
  const { files, ide, preferences } = useSelector(state => state);

  const htmlFile = useSelector(state => getHTMLFile(state.files));
  const projectName = useSelector(state => state.project.name);
  const selectedFile = useSelector(state => state.files.find(file => file.isSelectedFile) ||
    state.files.find(file => file.name === 'sketch.js') ||
    state.files.find(file => file.name !== 'root'));

  const {
    setTextOutput, setGridOutput, setSoundOutput, dispatchConsoleEvent,
    endSketchRefresh, stopSketch, setBlobUrl, expandConsole, clearConsole
  } = bindActionCreators({
    ...ProjectActions, ...IDEActions, ...PreferencesActions, ...ConsoleActions, ...FilesActions
  }, useDispatch());

  return (
    <Screen fullscreen>
      <Header
        leftButton={<IconButton to="/mobile" icon={ExitIcon} aria-label="Return to original editor" />}
        title={projectName}
      />
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
      <Footer>
        <Console />
      </Footer>
    </Screen>);
};

export default MobileSketchView;
