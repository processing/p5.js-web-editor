import React, { useReducer, useState, useEffect, useMemo } from 'react';
import { render } from 'react-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import {
  registerFrame,
  listen,
  MessageTypes,
  dispatchMessage
} from '../../utils/dispatcher';
import { filesReducer, setFiles } from './filesReducer';
import EmbedFrame from './EmbedFrame';
import CoordinateTracker from './CoordinateTracker';
import theme from '../../theme';
import getConfig from '../../utils/getConfig';
import { initialState } from '../IDE/reducers/files';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;

const App = () => {
  const [state, dispatch] = useReducer(filesReducer, [], initialState);
  const [isPlaying, setIsPlaying] = useState(false);
  const [basePath, setBasePath] = useState('');
  const [textOutput, setTextOutput] = useState(false);
  const [gridOutput, setGridOutput] = useState(false);
  const [userTheme, setUserTheme] = useState('light');
  const [coordinatesVisible, setCoordinatesVisible] = useState(false);
  const [sketchReloaded, setSketchReloaded] = useState(0);

  registerFrame(window.parent, getConfig('EDITOR_URL'));

  function handleMessageEvent(message) {
    console.log('message', message);
    const { type, payload } = message;
    switch (type) {
      case MessageTypes.SKETCH:
        dispatch(setFiles(payload.files));
        setBasePath(payload.basePath);
        setTextOutput(payload.textOutput);
        setGridOutput(payload.gridOutput);
        setUserTheme(payload.userTheme);
        setCoordinatesVisible(payload.coordinates);
        setSketchReloaded((prev) => prev + 1);
        break;
      case MessageTypes.START:
        console.log('starting');
        setIsPlaying(true);
        break;
      case MessageTypes.STOP:
        setIsPlaying(false);
        setCoordinatesVisible(false);
        break;
      case MessageTypes.REGISTER:
        dispatchMessage({ type: MessageTypes.REGISTER });
        break;
      case MessageTypes.EXECUTE:
        dispatchMessage(payload);
        break;
      case MessageTypes.COORDINATES_VISIBILITY:
        console.log('coordinates visibility', payload);
        if (isPlaying) setCoordinatesVisible(payload);
        break;
      default:
        break;
    }
  }

  function addCacheBustingToAssets(files) {
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

  const memoizedFiles = useMemo(() => addCacheBustingToAssets(state), [
    state,
    addCacheBustingToAssets
  ]);

  useEffect(() => {
    const unsubscribe = listen(handleMessageEvent);
    return function cleanup() {
      unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider theme={theme[userTheme]}>
      <GlobalStyle />
      {coordinatesVisible && (
        <CoordinateTracker
          isPlaying={isPlaying}
          sketchReloaded={sketchReloaded}
        />
      )}
      <EmbedFrame
        files={memoizedFiles}
        isPlaying={isPlaying}
        basePath={basePath}
        gridOutput={gridOutput}
        textOutput={textOutput}
      />
    </ThemeProvider>
  );
};

render(<App />, document.getElementById('root'));
