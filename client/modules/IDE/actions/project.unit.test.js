import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as ProjectActions from './project';
import * as ActionTypes from '../../../constants';
import { apiClient } from '../../../utils/apiClient';
import browserHistory from '../../../browserHistory';
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

describe('saveProject ownership and immutability', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not save, leaves isSaving untouched, toasts and resolves for a sketch owned by another user', async () => {
    const store = mockStore({
      ...existingProjectState,
      project: {
        ...existingProjectState.project,
        owner: { id: 'someone-else' }
      }
    });
    const put = jest.spyOn(apiClient, 'put');
    const post = jest.spyOn(apiClient, 'post');

    await expect(
      store.dispatch(ProjectActions.saveProject())
    ).resolves.toBeUndefined();

    const actions = store.getActions();
    expect(put).not.toHaveBeenCalled();
    expect(post).not.toHaveBeenCalled();
    expect(actions).not.toContainEqual(ProjectActions.startSavingProject());
    expect(actions).toContainEqual({
      type: ActionTypes.SET_TOAST_TEXT,
      text: 'Toast.SketchFailedSave'
    });
    expect(actions).toContainEqual({ type: ActionTypes.SHOW_TOAST });
  });

  it('does not toast on autosave for a sketch owned by another user', async () => {
    const store = mockStore({
      ...existingProjectState,
      project: {
        ...existingProjectState.project,
        owner: { id: 'someone-else' }
      }
    });
    await store.dispatch(ProjectActions.saveProject(null, true));
    expect(store.getActions()).toEqual([]);
  });

  it('sends the selected file content without mutating state.files', async () => {
    const originalFile = { id: 'f1', name: 'sketch.js', content: 'old' };
    const otherFile = { id: 'f2', name: 'index.html', content: 'html' };
    const state = {
      ...existingProjectState,
      files: [originalFile, otherFile]
    };
    const store = mockStore(state);
    const put = jest
      .spyOn(apiClient, 'put')
      .mockRejectedValueOnce(new Error('Network Error'));

    await store.dispatch(
      ProjectActions.saveProject({ id: 'f1', content: 'new' })
    );

    expect(originalFile.content).toBe('old');
    expect(state.files[0]).toBe(originalFile);
    const [url, payload] = put.mock.calls[0];
    expect(url).toBe('/projects/project123');
    expect(payload.files).toEqual([
      { id: 'f1', name: 'sketch.js', content: 'new' },
      otherFile
    ]);
  });
});

describe('cloneProject', () => {
  const rootFile = { id: 'root1', name: 'root', children: [], content: '' };
  const cloneState = { ...existingProjectState, files: [rootFile] };
  const unsavedFalse = {
    type: ActionTypes.SET_UNSAVED_CHANGES,
    value: false
  };

  beforeEach(() => {
    jest.spyOn(browserHistory, 'push').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps unsaved changes and shows the failure toast when the copy fails', async () => {
    const store = mockStore(cloneState);
    const post = jest
      .spyOn(apiClient, 'post')
      .mockRejectedValueOnce(httpError(500, { error: 'boom' }));

    store.dispatch(ProjectActions.cloneProject());
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(post).toHaveBeenCalledTimes(1);
    const actions = store.getActions();
    expect(actions).not.toContainEqual(unsavedFalse);
    expect(actions).toContainEqual(
      ProjectActions.projectSaveFail({ error: 'boom' })
    );
    expect(actions).toContainEqual({
      type: ActionTypes.SET_TOAST_TEXT,
      text: 'Toast.SketchFailedSave'
    });
    expect(actions).toContainEqual({ type: ActionTypes.SHOW_TOAST });
  });

  it('clears unsaved changes and shows the saved toast on success', async () => {
    const store = mockStore(cloneState);
    jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { id: 'new1', user: { username: 'happydog' }, files: [] }
    });

    store.dispatch(ProjectActions.cloneProject());
    await new Promise((resolve) => setTimeout(resolve, 0));

    const actions = store.getActions();
    expect(actions).toContainEqual(unsavedFalse);
    expect(actions).toContainEqual({
      type: ActionTypes.SET_TOAST_TEXT,
      text: 'Toast.SketchSaved'
    });
    expect(actions).toContainEqual({ type: ActionTypes.SHOW_TOAST });
    expect(actions).not.toContainEqual(
      expect.objectContaining({ type: ActionTypes.PROJECT_SAVE_FAIL })
    );
  });
});
