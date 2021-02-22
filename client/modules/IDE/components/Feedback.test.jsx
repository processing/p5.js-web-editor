import React from 'react';
import { Helmet } from 'react-helmet';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import lodash from 'lodash';

import { render } from '../../../test-utils';

import Feedback from './Feedback';

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

const renderComponent = (extraProps = {}) => {
  const props = lodash.merge(
    {
      t: jest.fn()
    },
    extraProps
  );
  render(<Feedback {...props} />, container);

  return props;
};

it('It mounts successfully and changes the meta title to p5.js Web Editor | Feedback', () => {
  act(() => {
    renderComponent();
  });

  const helmet = Helmet.peek();
  expect(helmet.title).toEqual('p5.js Web Editor | Feedback');
});
