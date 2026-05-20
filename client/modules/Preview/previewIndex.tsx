import React, { useReducer, useState, useEffect } from 'react';
import { render } from 'react-dom';
import { createGlobalStyle } from 'styled-components';
import {
  registerFrame,
  listen,
  MessageTypes,
  dispatchMessage
} from '../../utils/dispatcher';
import type { Message } from '../../utils/dispatcher';
import { filesReducer, setFilesAction } from './filesReducer';
import type { PreviewFile } from './filesReducer';
import { EmbedFrame } from './EmbedFrame';
import { getConfig } from '../../utils/getConfig';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;

const App = () => {
  const [state, dispatch] = useReducer(filesReducer, [] as PreviewFile[]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [basePath, setBasePath] = useState('');
  const [textOutput, setTextOutput] = useState(false);
  const [gridOutput, setGridOutput] = useState(false);
  registerFrame(window.parent, getConfig('EDITOR_URL'));

  function handleMessageEvent(message: Message) {
    const { type, payload } = message;
    switch (type) {
      // eslint-disable-next-line max-len
      case MessageTypes.SKETCH: {
        const sketchPayload = payload as {
          files: PreviewFile[];
          basePath: string;
          textOutput: boolean;
          gridOutput: boolean;
        };
        dispatch(setFilesAction(sketchPayload.files));
        setBasePath(sketchPayload.basePath);
        setTextOutput(sketchPayload.textOutput);
        setGridOutput(sketchPayload.gridOutput);
        break;
      }
      case MessageTypes.START:
        setIsPlaying(true);
        break;
      case MessageTypes.STOP:
        setIsPlaying(false);
        break;
      case MessageTypes.REGISTER:
        dispatchMessage({ type: MessageTypes.REGISTER });
        break;
      case MessageTypes.EXECUTE:
        dispatchMessage(payload as Parameters<typeof dispatchMessage>[0]);
        break;
      default:
        break;
    }
  }

  function addCacheBustingToAssets(files: PreviewFile[]) {
    const timestamp = new Date().getTime();
    return files.map((file) => {
      if (file.url && !file.url.endsWith('obj') && !file.url.endsWith('stl')) {
        return {
          ...file,
          url: `${file.url}?v=${timestamp}`
        };
      }
      return file;
    });
  }

  useEffect(() => {
    const unsubscribe = listen(handleMessageEvent);
    return function cleanup() {
      unsubscribe();
    };
  });

  return (
    <React.Fragment>
      <GlobalStyle />
      <EmbedFrame
        files={addCacheBustingToAssets(state)}
        isPlaying={isPlaying}
        basePath={basePath}
        gridOutput={gridOutput}
        textOutput={textOutput}
      />
    </React.Fragment>
  );
};

render(<App />, document.getElementById('root'));
