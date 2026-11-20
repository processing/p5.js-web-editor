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
  //New test cases involving saving
  describe('ownership and the save payload', () => {
    it('does not save, or leave isSaving stuck, for a sketch someone else owns', async () => {
      store = mockStore({
        ...existingProjectState,
        project: {
          ...existingProjectState.project,
          owner: { id: 'someone-else' }
        }
      });
      const put = jest.spyOn(apiClient, 'put');
      const post = jest.spyOn(apiClient, 'post');

      await store.dispatch(ProjectActions.saveProject());

      expect(put).not.toHaveBeenCalled();
      expect(post).not.toHaveBeenCalled();
      expect(store.getActions()).not.toContainEqual(
        ProjectActions.startSavingProject()
      );
    });

    it('sends the editor content without changing the files in state', async () => {
      store = mockStore(existingProjectState);
      const put = jest
        .spyOn(apiClient, 'put')
        .mockRejectedValueOnce(new Error('Network Error'));
      const originalFile = existingProjectState.files.find(
        (file) => file.name === 'sketch.js'
      );
      const originalContent = originalFile.content;

      await store.dispatch(
        ProjectActions.saveProject({
          id: originalFile.id,
          content: 'new content'
        })
      );

      const sentFiles = put.mock.calls[0][1].files;
      const sentFile = sentFiles.find((file) => file.id === originalFile.id);
      expect(sentFile.content).toBe('new content');
      expect(originalFile.content).toBe(originalContent);
    });

    it('still saves when the selected file is not in the sketch', async () => {
      store = mockStore(existingProjectState);
      const put = jest
        .spyOn(apiClient, 'put')
        .mockRejectedValueOnce(new Error('Network Error'));

      await store.dispatch(
        ProjectActions.saveProject({ id: 'missing-file', content: 'x' })
      );

      expect(put).toHaveBeenCalledTimes(1);
      expect(put.mock.calls[0][1].files).toEqual(existingProjectState.files);
    });
  });
});
