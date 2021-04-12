import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import App from './App';
import {
  reduxRender,
  fireEvent,
  screen,
  within,
  prettyDOM
} from '../../test-utils';
import { initialTestState } from '../../testData/testReduxStore';

jest.mock('../../i18n');

describe('<App />', () => {
  // to attach the rendered DOM element to
  let container;

  const mockStore = configureStore([thunk]);
  const store = mockStore(initialTestState);

  const subject = () =>
    reduxRender(<App />, {
      store,
      container
    });

  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement('div');
    document.body.appendChild(container);
    // axios.get.mockImplementationOnce((x) => Promise.resolve({ data: 'foo' }));
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
    store.clearActions();
  });

  it('renders', () => {
    act(() => {
      subject();
    });
    console.log(prettyDOM(container));
    // expect(screen.getByText('testsketch1')).toBeInTheDocument();
    // expect(screen.getByText('testsketch2')).toBeInTheDocument();
  });
});
