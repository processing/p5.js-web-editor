import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as ProjectActions from './project';
import * as ActionTypes from '../../../constants';
import { apiClient } from '../../../utils/apiClient';
import { initialTestState } from '../../../testData/testReduxStore';

const mockStore = configureStore([thunk]);

const existingProjectState = {
  ...initialTestState,
  project: {
    ...initialTestState.project,
    id: 'project123',
    owner: { id: initialTestState.user.id }
  }
};

const newProjectState = {
  ...initialTestState,
  project: {
    ...initialTestState.project,
    id: undefined,
    owner: undefined
  }
};

const httpError = (status, data) => ({
  response: { status, data }
});

const expectSaveFailureToast = (actions) => {
  expect(actions).toContainEqual(ProjectActions.startSavingProject());
  expect(actions).toContainEqual(ProjectActions.endSavingProject());
  expect(actions).toContainEqual({
    type: ActionTypes.SET_TOAST_TEXT,
    text: 'Toast.SketchFailedSave'
  });
  expect(actions).toContainEqual({ type: ActionTypes.SHOW_TOAST });
};

describe('saveProject', () => {
  let store;

  afterEach(() => {
    jest.restoreAllMocks();
    if (store) {
      store.clearActions();
    }
  });

  describe('updating an existing project (PUT)', () => {
    it('handles a network error without throwing when error.response is undefined', async () => {
      store = mockStore(existingProjectState);
      jest
        .spyOn(apiClient, 'put')
        .mockRejectedValueOnce(new Error('Network Error'));

      await expect(
        store.dispatch(ProjectActions.saveProject())
      ).resolves.toBeUndefined();

      const actions = store.getActions();
      expectSaveFailureToast(actions);
      expect(actions).toContainEqual(ProjectActions.projectSaveFail(undefined));
      expect(actions).not.toContainEqual(
        expect.objectContaining({ type: ActionTypes.SHOW_ERROR_MODAL })
      );
    });

    it('shows the staleSession modal on 403', async () => {
      store = mockStore(existingProjectState);
      jest
        .spyOn(apiClient, 'put')
        .mockRejectedValueOnce(httpError(403, { error: 'Forbidden' }));

      await store.dispatch(ProjectActions.saveProject());

      const actions = store.getActions();
      expectSaveFailureToast(actions);
      expect(actions).toContainEqual({
        type: ActionTypes.SHOW_ERROR_MODAL,
        modalType: 'staleSession'
      });
      expect(actions).not.toContainEqual(
        expect.objectContaining({ type: ActionTypes.PROJECT_SAVE_FAIL })
      );
    });

    it('shows the staleProject modal on 409', async () => {
      store = mockStore(existingProjectState);
      jest
        .spyOn(apiClient, 'put')
        .mockRejectedValueOnce(httpError(409, { error: 'Conflict' }));

      await store.dispatch(ProjectActions.saveProject());

      const actions = store.getActions();
      expectSaveFailureToast(actions);
      expect(actions).toContainEqual({
        type: ActionTypes.SHOW_ERROR_MODAL,
        modalType: 'staleProject'
      });
      expect(actions).not.toContainEqual(
        expect.objectContaining({ type: ActionTypes.PROJECT_SAVE_FAIL })
      );
    });
  });

  describe('creating a new project (POST)', () => {
    it('handles a network error without throwing when error.response is undefined', async () => {
      store = mockStore(newProjectState);
      jest
        .spyOn(apiClient, 'post')
        .mockRejectedValueOnce(new Error('Network Error'));

      await expect(
        store.dispatch(ProjectActions.saveProject())
      ).resolves.toBeUndefined();

      const actions = store.getActions();
      expectSaveFailureToast(actions);
      expect(actions).toContainEqual(ProjectActions.projectSaveFail(undefined));
      expect(actions).not.toContainEqual(
        expect.objectContaining({ type: ActionTypes.SHOW_ERROR_MODAL })
      );
    });

    it('shows the staleSession modal on 403', async () => {
      store = mockStore(newProjectState);
      jest
        .spyOn(apiClient, 'post')
        .mockRejectedValueOnce(httpError(403, { error: 'Forbidden' }));

      await store.dispatch(ProjectActions.saveProject());

      const actions = store.getActions();
      expectSaveFailureToast(actions);
      expect(actions).toContainEqual({
        type: ActionTypes.SHOW_ERROR_MODAL,
        modalType: 'staleSession'
      });
      expect(actions).not.toContainEqual(
        expect.objectContaining({ type: ActionTypes.PROJECT_SAVE_FAIL })
      );
    });
  });
});
