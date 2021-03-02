import React, { useReducer, useState, useEffect } from 'react';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader/root';
import loopProtect from 'loop-protect';
import { Hook } from 'console-feed';
import { createGlobalStyle } from 'styled-components';
import { listen, MessageTypes } from '../../utils/dispatcher';
import {
  filesReducer,
  initialState,
  setFiles,
  useSelectors,
  getFileSelectors
} from './filesReducer';
import EmbedFrame from './EmbedFrame';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;

const App = () => {
  const [state, dispatch] = useReducer(filesReducer, [], initialState);
  const [isPlaying, setIsPlaying] = useState(false);
  function handleMessageEvent(message) {
    console.log('embedframe received message event');
    const { type, payload } = message;
    switch (type) {
      case MessageTypes.FILES:
        dispatch(setFiles(payload));
        break;
      case MessageTypes.START:
        setIsPlaying(true);
        break;
      case MessageTypes.STOP:
        setIsPlaying(false);
        break;
      default:
        break;
    }
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
      <EmbedFrame files={state} isPlaying={isPlaying} />
    </React.Fragment>
  );
};

const HotApp = hot(App);

render(<HotApp />, document.getElementById('root'));
