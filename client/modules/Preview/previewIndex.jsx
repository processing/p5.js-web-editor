import React, {
  useReducer,
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import { render } from 'react-dom';
import { createGlobalStyle } from 'styled-components';
import {
  registerFrame,
  listen,
  MessageTypes,
  dispatchMessage
} from '../../utils/dispatcher';
import { filesReducer, setFiles } from './filesReducer';
import EmbedFrame from './EmbedFrame';
import { getConfig } from '../../utils/getConfig';
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
  const sketchFrameRef = useRef(null);
  registerFrame(window.parent, getConfig('EDITOR_URL'));

  const sendPreviewImage = useCallback(() => {
    try {
      const iframeDocument = sketchFrameRef.current?.contentDocument;
      const canvas = iframeDocument?.querySelector('canvas');
      if (!canvas || !canvas.width || !canvas.height) {
        dispatchMessage({
          type: MessageTypes.PREVIEW_IMAGE,
          payload: { image: null }
        });
        return;
      }

      const maxDimension = 400;
      const scale = Math.min(
        maxDimension / canvas.width,
        maxDimension / canvas.height,
        1
      );
      const targetWidth = Math.max(1, Math.floor(canvas.width * scale));
      const targetHeight = Math.max(1, Math.floor(canvas.height * scale));
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = targetWidth;
      previewCanvas.height = targetHeight;
      const ctx = previewCanvas.getContext('2d');
      if (!ctx) {
        dispatchMessage({
          type: MessageTypes.PREVIEW_IMAGE,
          payload: { image: null }
        });
        return;
      }
      ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
      const image = previewCanvas.toDataURL('image/png');

      dispatchMessage({
        type: MessageTypes.PREVIEW_IMAGE,
        payload: { image }
      });
    } catch (error) {
      dispatchMessage({
        type: MessageTypes.PREVIEW_IMAGE,
        payload: { image: null }
      });
    }
  }, []);

  function handleMessageEvent(message) {
    const { type, payload } = message;
    switch (type) {
      case MessageTypes.SKETCH:
        dispatch(setFiles(payload.files));
        setBasePath(payload.basePath);
        setTextOutput(payload.textOutput);
        setGridOutput(payload.gridOutput);
        break;
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
        dispatchMessage(payload);
        break;
      case MessageTypes.REQUEST_PREVIEW_IMAGE:
        sendPreviewImage();
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
        frameRef={sketchFrameRef}
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
