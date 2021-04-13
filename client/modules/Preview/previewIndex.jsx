import React, { useReducer, useState, useEffect } from 'react';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { createGlobalStyle } from 'styled-components';
import {
  registerFrame,
  listen,
  MessageTypes,
  dispatchMessage
} from '../../utils/dispatcher';
import { filesReducer, initialState, setFiles } from './filesReducer';
import EmbedFrame from './EmbedFrame';
import getConfig from '../../utils/getConfig';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
  }
`;

const App = () => {
  const [state, dispatch] = useReducer(filesReducer, [], initialState);
  const [isPlaying, setIsPlaying] = useState(false);
  registerFrame(window.parent, getConfig('EDITOR_URL'));

  function handleMessageEvent(message) {
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
      case MessageTypes.REGISTER:
        dispatchMessage({ type: MessageTypes.REGISTER });
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
