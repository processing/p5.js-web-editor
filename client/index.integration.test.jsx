import { setupServer } from 'msw/node';
import { rest } from 'msw';
import React from 'react';
import { Router, browserHistory } from 'react-router';

import {
  reduxRender,
  act,
  waitFor,
  fireEvent,
  screen,
  within
} from './test-utils';
import configureStore from './store';
import routes from './routes';
import * as Actions from './modules/User/actions';
import { userResponse } from './testData/testServerResponses';

// setup for the app
const history = browserHistory;
const initialState = window.__INITIAL_STATE__;
const store = configureStore(initialState);

// need to mock this file or it'll throw ERRCONNECTED
jest.mock('./i18n');

// setup for the msw fake server
const server = setupServer(
  rest.get('/session', (req, res, ctx) =>
    // console.log("called server get session");
    res(ctx.json(userResponse))
  )
);

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'warn'
  })
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// below are fixes for jsdom-specific errors
// https://stackoverflow.com/questions/57311971/error-not-implemented-window-scrollto-how-do-we-remove-this-error-from-jest-t
const noop = () => {};
Object.defineProperty(window, 'focus', { value: noop, writable: true });

// https://github.com/jsdom/jsdom/issues/3002
document.createRange = () => {
  const range = new Range();

  range.getBoundingClientRect = jest.fn();

  range.getClientRects = () => ({
    item: () => null,
    length: 0,
    [Symbol.iterator]: jest.fn()
  });

  return range;
};

// start testing
describe('index.jsx integration', () => {
  // the subject under test
  const subject = () =>
    reduxRender(<Router history={history} routes={routes(store)} />, { store });

  // spy on this function and wait for it to be called before making assertions
  const spy = jest.spyOn(Actions, 'getUser');

  beforeEach(async () => {
    act(() => {
      subject();
    });

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
  });

  afterEach(() => {
    spy.mockClear();
  });

  it('navbar items and the dropdowns in the navbar exist', () => {
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();

    const fileButton = within(navigation).getByRole('button', {
      name: /^file$/i
    });
    expect(fileButton).toBeInTheDocument();

    const newFileButton = within(navigation).getByRole('button', {
      name: /^new$/i
    });
    expect(newFileButton).toBeInTheDocument();

    // save file button not shown?

    // const exampleFileButton = within(navigation).getByRole('link', {name: /^examples$/i});
    // expect(exampleFileButton).toBeInTheDocument();

    const editButton = within(navigation).getByRole('button', {
      name: /^edit$/i
    });
    expect(editButton).toBeInTheDocument();

    const sketchButton = within(navigation).getByRole('button', {
      name: /^sketch$/i
    });
    expect(sketchButton).toBeInTheDocument();

    const helpButton = within(navigation).getByRole('button', {
      name: /^help$/i
    });
    expect(helpButton).toBeInTheDocument();
  });

  it('toolbar elements exist', () => {
    const playButton = screen.getByRole('button', {
      name: /play only visual sketch/i
    });
    expect(playButton).toBeInTheDocument();

    const stopButton = screen.getByRole('button', {
      name: /stop sketch/i
    });
    expect(stopButton).toBeInTheDocument();

    const editSketchNameButton = screen.getByRole('button', {
      name: /edit sketch name/i
    });
    expect(editSketchNameButton).toBeInTheDocument();

    expect(screen.getByText('Auto-refresh')).toBeInTheDocument();
  });

  it('preview exists', () => {
    expect(
      screen.getByRole('heading', { name: /preview/i })
    ).toBeInTheDocument();
    const preview = screen.getByRole('main', { name: /sketch output/i });
    expect(preview).toBeInTheDocument();
  });

  it('code editor exists', () => {
    const codeeditor = screen.getByRole('article');
    expect(codeeditor).toBeInTheDocument();
  });

  it('sidebar exists', () => {
    expect(screen.getByText('Sketch Files')).toBeInTheDocument();
  });

  it('clicking on play updates the preview iframe with a srcdoc, stop clears it', () => {
    const playButton = screen.getByRole('button', {
      name: /play only visual sketch/i
    });
    const preview = screen.getByRole('main', { name: /sketch output/i });
    expect(preview.getAttribute('srcdoc')).toBeFalsy();
    act(() => {
      fireEvent.click(playButton);
    });

    expect(preview.getAttribute('srcdoc')).toBeTruthy();

    const stopButton = screen.getByRole('button', {
      name: /stop sketch/i
    });
    act(() => {
      fireEvent.click(stopButton);
    });
    expect(preview.getAttribute('srcdoc')).toMatch(/(^|")\s*($|")/);
  });
});
