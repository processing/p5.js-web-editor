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
let lastSearchParams;

const mockOpSketches = mockProjects.map((project) => ({
  visualID: project.id,
  title: project.name,
  createdOn: project.createdAt,
  isPrivate: 0
}));

const server = setupServer(
  rest.get(`/user/${initialTestState.user.id}/sketches`, (req, res, ctx) => {
    lastSearchParams = req.url.searchParams;
    return res(ctx.set('X-Total-Count', '54'), ctx.json(mockOpSketches));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  lastSearchParams = undefined;
});
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

  it('passes search queries to the OP sketches API', () => {
    store = mockStore(initialTestState);

    return store
      .dispatch(ProjectActions.getProjects('happydog', { q: ' test ' }))
      .then(() => expect(lastSearchParams.get('q')).toBe('test'));
  });

  it('aborts in-flight OP sketch requests when a new request starts', async () => {
    store = mockStore(initialTestState);
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');

    server.use(
      rest.get(
        `/user/${initialTestState.user.id}/sketches`,
        (req, res, ctx) => {
          lastSearchParams = req.url.searchParams;
          const delay = lastSearchParams.get('q') === 'first' ? 100 : 0;

          return res(
            ctx.delay(delay),
            ctx.set('X-Total-Count', '54'),
            ctx.json(mockOpSketches)
          );
        }
      )
    );

    try {
      const firstRequest = store.dispatch(
        ProjectActions.getProjects('happydog', { q: 'first' })
      );
      const secondRequest = store.dispatch(
        ProjectActions.getProjects('happydog', { q: 'second' })
      );

      await secondRequest;
      await firstRequest;

      expect(abortSpy).toHaveBeenCalledTimes(1);
      expect(lastSearchParams.get('q')).toBe('second');
    } finally {
      abortSpy.mockRestore();
    }
  });
});
