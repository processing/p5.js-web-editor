import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import lodash from 'lodash';

import {
  fireEvent,
  reduxRender,
  screen,
  waitFor
} from '../../../../test-utils';
import { selectProjectName } from '../../selectors/project';
import ToolbarComponent from './Toolbar';

const server = setupServer(
  rest.put(`/projects/id`, (req, res, ctx) => res(ctx.json(req.body)))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderComponent = (extraState = {}) => {
  const initialState = lodash.merge(
    {
      ide: {
        isPlaying: false
      },
      user: {
        authenticated: true,
        username: 'me',
        id: 'userId'
      },
      project: {
        name: 'testname',
        id: 'id',
        owner: {
          username: 'me',
          id: 'userId'
        }
      }
    },
    extraState
  );

  const props = {
    syncFileContent: jest.fn()
  };

  return {
    ...props,
    ...reduxRender(<ToolbarComponent {...props} />, { initialState })
  };
};

describe('<ToolbarComponent />', () => {
  it('sketch owner can switch to sketch name editing mode', async () => {
    renderComponent();
    const sketchName = screen.getByLabelText('Edit sketch name');

    fireEvent.click(sketchName);

    await waitFor(() => {
      expect(screen.getByLabelText('New sketch name')).toHaveFocus();
      expect(screen.getByLabelText('New sketch name')).toBeEnabled();
    });
  });

  it("non-owner can't switch to sketch editing mode", async () => {
    renderComponent({ user: { username: 'not-me', id: 'not-me' } });
    const sketchName = screen.getByLabelText('Edit sketch name');

    fireEvent.click(sketchName);

    expect(sketchName).toBeDisabled();
    await waitFor(() =>
      // expect(screen.getByLabelText('New sketch name').disabled).toBe(true)
      expect(screen.getByLabelText('New sketch name')).toBeDisabled()
    );
  });

  it('sketch owner can change name', async () => {
    const { store } = renderComponent();

    const sketchNameInput = screen.getByLabelText('New sketch name');
    fireEvent.change(sketchNameInput, {
      target: { value: 'my new sketch name' }
    });
    fireEvent.blur(sketchNameInput);

    await waitFor(() =>
      expect(selectProjectName(store.getState())).toBe('my new sketch name')
    );
  });

  it("sketch owner can't change to empty name", async () => {
    const { store } = renderComponent();

    const sketchNameInput = screen.getByLabelText('New sketch name');
    fireEvent.change(sketchNameInput, { target: { value: '' } });
    fireEvent.blur(sketchNameInput);

    await waitFor(() =>
      expect(selectProjectName(store.getState())).toBe('testname')
    );
  });

  it('sketch is stopped when stop button is clicked', async () => {
    const { store } = renderComponent({ ide: { isPlaying: true } });

    const stopButton = screen.getByLabelText('Stop sketch');

    fireEvent.click(stopButton);

    await waitFor(() => expect(store.getState().ide.isPlaying).toBe(false));
  });

  it('sketch is started when play button is clicked', async () => {
    const { store } = renderComponent();
    const playButton = screen.getByLabelText('Play only visual sketch');
    fireEvent.click(playButton);

    await waitFor(() => expect(store.getState().ide.isPlaying).toBe(true));
  });

  it('sketch content is synched when play button is clicked', async () => {
    const props = renderComponent();
    const playButton = screen.getByLabelText('Play only visual sketch');
    fireEvent.click(playButton);

    await waitFor(() => expect(props.syncFileContent).toHaveBeenCalled());
  });
});
