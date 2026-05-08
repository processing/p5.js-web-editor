import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import * as ProjectActions from './projects';
import * as ActionTypes from '../../../constants';
import { startLoader, stopLoader } from '../reducers/loading';
import {
  initialTestState,
  mockProjects
} from '../../../testData/testReduxStore';

const mockStore = configureStore([thunk]);

const mockOpSketches = mockProjects.map((project) => ({
  visualID: project.id,
  title: project.name,
  createdOn: project.createdAt,
  isPrivate: 0
}));

const server = setupServer(
  rest.get(`/user/${initialTestState.user.id}/sketches`, (req, res, ctx) =>
    res(ctx.set('X-Total-Count', '54'), ctx.json(mockOpSketches))
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
    const expectedProjects = {
      projects: mockProjects.map((project) => ({
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
        updatedAt: project.createdAt,
        visibility: project.visibility
      })),
      metadata: {
        page: 1,
        totalPages: 6,
        totalProjects: 54,
        limit: 10,
        hasPagination: true
      }
    };

    const expectedActions = [
      { type: startLoader.type },
      { type: ActionTypes.SET_PROJECTS, projects: expectedProjects },
      { type: stopLoader.type }
    ];

    return store
      .dispatch(ProjectActions.getProjects('happydog'))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
  });
});
