import React, { useRef } from 'react';
import { bindActionCreators } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import * as ProjectActions from '../../modules/IDE/actions/project';
import * as IDEActions from '../../modules/IDE/actions/ide';
import * as PreferencesActions from '../../modules/IDE/actions/preferences';
import * as ConsoleActions from '../../modules/IDE/actions/console';
import * as FilesActions from '../../modules/IDE/actions/files';

import { getHTMLFile } from '../../modules/IDE/reducers/files';

import PreviewFrame from '../../modules/IDE/components/PreviewFrame';
import { useDraggable } from '../../utils/custom-hooks';

import { remSize, prop } from '../../theme';

const FloatingContainer = styled.div`
  & {
    height: ${remSize(160)};
    width: ${remSize(160)};
    right: ${remSize(8)};
    bottom: ${remSize(8 + 48)};
    overflow: hidden;
    box-shadow: 0 4px 18px 0 ${prop('shadowColor')};
  }

  position: absolute;
  display: flex;
  z-index: 1;

  iframe#canvas_frame,
  .preview-frame {
    border-radius: 4px !important;
  }
`;

const Dragger = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 2;
`;

export default () => {
  const { files, ide, preferences } = useSelector((state) => state);

  const htmlFile = useSelector((state) => getHTMLFile(state.files));
  const selectedFile = useSelector(
    (state) =>
      state.files.find((file) => file.isSelectedFile) ||
      state.files.find((file) => file.name === 'sketch.js') ||
      state.files.find((file) => file.name !== 'root')
  );

  const {
    setTextOutput,
    setGridOutput,
    setSoundOutput,
    dispatchConsoleEvent,
    endSketchRefresh,
    stopSketch,
    setBlobUrl,
    expandConsole,
    clearConsole
  } = bindActionCreators(
    {
      ...ProjectActions,
      ...IDEActions,
      ...PreferencesActions,
      ...ConsoleActions,
      ...FilesActions
    },
    useDispatch()
  );

  const draggableRef = useRef({});
  const setRef = (r) => {
    draggableRef.current = r;
  };
  useDraggable(draggableRef);

  return (
    <FloatingContainer ref={(r) => setRef(r)}>
      <Dragger ref={(r) => setRef(r)} />
      <PreviewFrame
        htmlFile={htmlFile}
        files={files}
        head={
          <link type="text/css" rel="stylesheet" href="/preview-styles.css" />
        }
        resize
        draggable
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
    </FloatingContainer>
  );
};
