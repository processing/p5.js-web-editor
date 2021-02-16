import React from 'react';
import { Helmet } from 'react-helmet';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

import { FeedbackTestComponent } from './Feedback';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it('It mounts successfully and changes the meta title to Feedback.Title', () => {
  act(() => {
    render(<FeedbackTestComponent t={(key) => key} />, container);
  });

  const helmet = Helmet.peek();
  expect(helmet.title).toEqual('Feedback.Title');
});
