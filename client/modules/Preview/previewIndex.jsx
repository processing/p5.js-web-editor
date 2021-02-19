import React, { useReducer } from 'react';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader/root';
import loopProtect from 'loop-protect';
import { Hook } from 'console-feed';
import { listen } from '../../utils/dispatcher';
import {
  filesReducer,
  initialState,
  setFiles,
  useSelectors,
  mapStateToSelectors
} from './filesReducer';
import EmbedFrame from './EmbedFrame';

const App = () => {
  const [state, dispatch] = useReducer(filesReducer, [], initialState);
  function handleMessageEvent(message) {
    // types are start, stop, setFiles. Kind of like a reducer
    const { type, files } = message;
    if (type === 'render') {
      dispatch(setFiles(files));
      // use preview frame to create srcdoc
      // render iframe baby
    }
  }
};

const HotApp = hot(App);

render(<HotApp />, document.getElementById('root'));
