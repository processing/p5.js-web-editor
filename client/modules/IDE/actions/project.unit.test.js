import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as ProjectActions from './project';
import * as ActionTypes from '../../../constants';
import { apiClient } from '../../../utils/apiClient';
import { initialTestState } from '../../../testData/testReduxStore';

const mockStore = configureStore([thunk]);

describe('project actions saveProject unit tests', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    store.clearActions();
  });

  describe('updating existing project (PUT)', () => {
    const existingProjectState = {
      ...initialTestState,
      project: {
        ...initialTestState.project,
        id: 'project123',
        owner: { id: initialTestState.user.id }
      }
    };

    it('handles network error when error.response is undefined without throwing TypeError', async () => {
      store = mockStore(existingProjectState);
      const networkError = new Error('Network Error');
      // error.response is undefined on network failure
      jest.spyOn(apiClient, 'put').mockRejectedValueOnce(networkError);

      await store.dispatch(ProjectActions.saveProject());

      const actions = store.getActions();
      expect(actions).toContainEqual(ProjectActions.startSavingProject());
      expect(actions).toContainEqual(ProjectActions.endSavingProject());
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: ActionTypes.SET_TOAST_TEXT,
          text: 'Toast.SketchFailedSave'
        })
      );
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: ActionTypes.SHOW_TOAST
        })
      );
      expect(actions).toContainEqual(ProjectActions.projectSaveFail(undefined));
    });

    it('handles 403 response with staleSession error modal', async () => {
      store = mockStore(existingProjectState);
      const error403 = {
        response: {
          status: 403,
          data: { error: 'Forbidden' }
        }
      };
      jest.spyOn(apiClient, 'put').mockRejectedValueOnce(error403);

      await store.dispatch(ProjectActions.saveProject());

      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: ActionTypes.SHOW_ERROR_MODAL,
        modalType: 'staleSession'
      });
    });

    it('handles 409 response with staleProject error modal', async () => {
      store = mockStore(existingProjectState);
      const error409 = {
        response: {
          status: 409,
          data: { error: 'Conflict' }
        }
      };
      jest.spyOn(apiClient, 'put').mockRejectedValueOnce(error409);

      await store.dispatch(ProjectActions.saveProject());

      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: ActionTypes.SHOW_ERROR_MODAL,
        modalType: 'staleProject'
      });
    });
  });

  describe('creating new project (POST)', () => {
    const newProjectState = {
      ...initialTestState,
      project: {
        ...initialTestState.project,
        id: undefined,
        owner: undefined
      }
    };

    it('handles network error when error.response is undefined without throwing TypeError', async () => {
      store = mockStore(newProjectState);
      const networkError = new Error('Network Error');
      // error.response is undefined on network failure
      jest.spyOn(apiClient, 'post').mockRejectedValueOnce(networkError);

      await store.dispatch(ProjectActions.saveProject());

      const actions = store.getActions();
      expect(actions).toContainEqual(ProjectActions.startSavingProject());
      expect(actions).toContainEqual(ProjectActions.endSavingProject());
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: ActionTypes.SET_TOAST_TEXT,
          text: 'Toast.SketchFailedSave'
        })
      );
      expect(actions).toContainEqual(
        expect.objectContaining({
          type: ActionTypes.SHOW_TOAST
        })
      );
      expect(actions).toContainEqual(ProjectActions.projectSaveFail(undefined));
    });

    it('handles 403 response when creating new project', async () => {
      store = mockStore(newProjectState);
      const error403 = {
        response: {
          status: 403,
          data: { error: 'Forbidden' }
        }
      };
      jest.spyOn(apiClient, 'post').mockRejectedValueOnce(error403);

      await store.dispatch(ProjectActions.saveProject());

      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: ActionTypes.SHOW_ERROR_MODAL,
        modalType: 'staleSession'
      });
    });
  });
});
