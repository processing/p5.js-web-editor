import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import Editor from './Editor';
import {
  reduxRender,
  fireEvent,
  screen,
  within,
  prettyDOM
} from '../../../test-utils';
import { initialTestState } from '../../../testData/testReduxStore';

jest.mock('../../../i18n');

// const server = setupServer(
//   rest.get(`/${initialTestState.user.username}/projects`, (req, res, ctx) =>
//     // it just needs to return something so it doesn't throw an error
//     // Sketchlist tries to grab projects on creation but for the unit test
//     // we just feed those in as part of the initial state
//     res(ctx.json({ data: 'foo' }))
//   )
// );

// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

describe('<Editor />', () => {
  const mockStore = configureStore([thunk]);
  const store = mockStore(initialTestState);

  const subjectProps = { provideController: jest.fn() };

  const subject = () => reduxRender(<Editor {...subjectProps} />, { store });

  afterEach(() => {
    store.clearActions();
  });

  it('renders successfully', () => {
    act(() => {
      subject();
    });
  });
});
