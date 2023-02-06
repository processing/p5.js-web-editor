import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import * as ProjectActions from './projects';
import * as ActionTypes from '../../../constants';
import {
  initialTestState,
  mockProjects
} from '../../../testData/testReduxStore';

const mockStore = configureStore([thunk]);

const server = setupServer(
  rest.get(`/${initialTestState.user.username}/projects`, (req, res, ctx) =>
    res(ctx.json(mockProjects))
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('projects action creator tests', () => {
  let store;

  afterEach(() => {
    store.clearActions();
  });

  it('creates GET_PROJECTS after successfuly fetching projects', () => {
    store = mockStore(initialTestState);

    const expectedActions = [
      { type: ActionTypes.START_LOADING },
      { type: ActionTypes.SET_PROJECTS, projects: mockProjects },
      { type: ActionTypes.STOP_LOADING }
    ];

    return store
      .dispatch(ProjectActions.getProjects('happydog'))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
  });
});
