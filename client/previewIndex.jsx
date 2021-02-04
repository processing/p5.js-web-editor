import React from 'react';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader/root';
import loopProtect from 'loop-protect';
import { Hook } from 'console-feed';


const App = () => (

);

const HotApp = hot(App)l

render(
  <HotApp />,
  document.getElementById('root')
);
