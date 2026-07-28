import JSZip from 'jszip';
import browserHistory from '../../../browserHistory';
import { opApiClient } from '../../../utils/opApiClient';
import {
  opSketchToProject,
  opVisualIdToProjectId,
  editorFilesToCodeTabs,
  editorFilesToZipEntries,
  visibilityToOpPrivacy
} from '../../../utils/opSketchAdapter';
import * as ActionTypes from '../../../constants';
import { showToast, setToastText } from './toast';
import {
  setUnsavedChanges,
  justOpenedProject,
  resetJustOpenedProject,
  showErrorModal,
  setPreviousPath
} from './ide';
import { clearLocalBackup } from '../utils/localBackup';
import { clearState, saveState } from '../../../persistState';

export function setProject(project) {
  return {
    type: ActionTypes.SET_PROJECT,
    project,
    files: project.files,
    owner: project.user,
    visibility: project.visibility
  };
}

export function setProjectName(name) {
  return {
    type: ActionTypes.SET_PROJECT_NAME,
    name
  };
}

export function projectSaveFail(error) {
  return {
    type: ActionTypes.PROJECT_SAVE_FAIL,
    error
  };
}

export function setNewProject(project) {
  return {
    type: ActionTypes.NEW_PROJECT,
    project,
    owner: project.user,
    files: project.files
  };
}

function getRequestErrorPayload(error, fallbackMessage = 'Request failed.') {
  const data = error?.response?.data;
  if (data && typeof data === 'object') {
    return data;
  }

  return {
    message:
      data || error?.response?.message || error?.message || fallbackMessage
  };
}

function usernamesMatch(a, b) {
  return String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();
}

// Resolves to { notFound: true } when the sketch doesn't exist, or when it
// exists but belongs to someone other than the username in the URL — that
// address doesn't identify a sketch, so callers render a 404.
export function getProject(id, ownerUsername) {
  return async (dispatch, getState) => {
    dispatch(justOpenedProject());
    try {
      const [sketchRes, codeRes, filesRes] = await Promise.all([
        opApiClient.get(`/sketch/${id}`),
        opApiClient.get(`/sketch/${id}/code`),
        opApiClient.get(`/sketch/${id}/files`)
      ]);
      const sketch = sketchRes.data;
      if (ownerUsername && !usernamesMatch(sketch.username, ownerUsername)) {
        return { notFound: true };
      }
      const fallbackUsername = getState().user.username ?? '';
      const project = opSketchToProject(
        sketch,
        codeRes.data,
        sketch.username ?? ownerUsername ?? fallbackUsername,
        filesRes.data
      );
      dispatch(setProject(project));
      dispatch(setUnsavedChanges(false));
      return { notFound: false };
    } catch (error) {
      if (error?.response?.status === 404) {
        return { notFound: true };
      }
      dispatch({
        type: ActionTypes.ERROR,
        error: getRequestErrorPayload(error)
      });
      return { notFound: false };
    }
  };
}

export function persistState() {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.PERSIST_STATE
    });
    const state = getState();
    saveState(state);
  };
}

export function clearPersistedState() {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.CLEAR_PERSISTED_STATE
    });
    clearState();
  };
}

export function startSavingProject() {
  return {
    type: ActionTypes.START_SAVING_PROJECT
  };
}

export function endSavingProject() {
  return {
    type: ActionTypes.END_SAVING_PROJECT
  };
}

export function projectSaveSuccess() {
  return {
    type: ActionTypes.PROJECT_SAVE_SUCCESS
  };
}

function createCodeTabs(visualID, codeTabs) {
  return Promise.all(
    codeTabs.map((tab, i) =>
      opApiClient.post(
        `/sketch/${visualID}/code/${encodeURIComponent(tab.title)}`,
        { code: tab.code, orderID: i }
      )
    )
  );
}

// Diff saved vs current tabs: delete removed ones, then upsert all current ones
function syncCodeTabs(visualID, savedTitles, currentTabs) {
  const currentTitles = currentTabs.map((t) => t.title);
  const toDelete = savedTitles.filter((t) => !currentTitles.includes(t));

  return Promise.all(
    toDelete.map((title) =>
      opApiClient.delete(
        `/sketch/${visualID}/code/${encodeURIComponent(title)}`
      )
    )
  ).then(() =>
    Promise.all(
      currentTabs.map((tab, i) => {
        if (savedTitles.includes(tab.title)) {
          return opApiClient.put(
            `/sketch/${visualID}/code/${encodeURIComponent(tab.title)}`,
            { code: tab.code, orderID: i }
          );
        }
        return opApiClient.post(
          `/sketch/${visualID}/code/${encodeURIComponent(tab.title)}`,
          { code: tab.code, orderID: i }
        );
      })
    )
  );
}

export function saveProject(selectedFile = null, autosave = false) {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.project.isSaving) {
      return;
    }
    dispatch(startSavingProject());

    if (
      state.user.id &&
      state.project.owner &&
      state.project.owner.id !== state.user.id
    ) {
      dispatch(endSavingProject());
      return;
    }

    const files = [...state.files];
    if (selectedFile) {
      const fileToUpdate = files.find((f) => f.id === selectedFile.id);
      if (fileToUpdate) fileToUpdate.content = selectedFile.content;
    }

    const codeTabs = editorFilesToCodeTabs(files);

    try {
      if (state.project.id) {
        // Update existing sketch
        const visualID = state.project.id;

        await opApiClient.patch(`/sketch/${visualID}`, {
          title: state.project.name,
          mode: 'html',
          isPrivate: visibilityToOpPrivacy(state.project.visibility)
        });

        await syncCodeTabs(
          visualID,
          state.project.savedCodeTitles ?? [],
          codeTabs
        );

        dispatch(endSavingProject());
        dispatch(setUnsavedChanges(false));
        clearLocalBackup(state.project.id);
        dispatch({
          type: ActionTypes.SET_SAVED_CODE_TITLES,
          titles: codeTabs.map((t) => t.title)
        });
        dispatch(projectSaveSuccess());

        if (!autosave) {
          if (state.ide.justOpenedProject && state.preferences.autosave) {
            dispatch(showToast(5500));
            dispatch(setToastText('Toast.SketchSaved'));
            setTimeout(
              () => dispatch(setToastText('Toast.AutosaveEnabled')),
              1500
            );
            dispatch(resetJustOpenedProject());
          } else {
            dispatch(showToast(1500));
            dispatch(setToastText('Toast.SketchSaved'));
          }
        }
      } else {
        // Create new sketch
        const sketchRes = await opApiClient.post('/sketch', {
          title: state.project.name,
          mode: 'html',
          isPrivate: visibilityToOpPrivacy(state.project.visibility)
        });

        const { visualID } = sketchRes.data;
        await createCodeTabs(visualID, codeTabs);
        const projectId = opVisualIdToProjectId(visualID);

        const createdProject = {
          id: projectId,
          name: state.project.name,
          visibility: state.project.visibility,
          fileBase: sketchRes.data.fileBase,
          files,
          savedCodeTitles: codeTabs.map((t) => t.title),
          updatedAt: sketchRes.data.createdOn ?? '',
          user: { username: state.user.username, id: state.user.id }
        };

        dispatch(endSavingProject());
        dispatch(setNewProject(createdProject));
        dispatch(setUnsavedChanges(false));
        browserHistory.push(`/${state.user.username}/sketches/${projectId}`);

        dispatch(projectSaveSuccess());
        if (!autosave) {
          if (state.preferences.autosave) {
            dispatch(showToast(5500));
            dispatch(setToastText('Toast.SketchSaved'));
            setTimeout(
              () => dispatch(setToastText('Toast.AutosaveEnabled')),
              1500
            );
            dispatch(resetJustOpenedProject());
          } else {
            dispatch(showToast(1500));
            dispatch(setToastText('Toast.SketchSaved'));
          }
        }
      }
    } catch (error) {
      const { response } = error;
      dispatch(endSavingProject());
      dispatch(setToastText('Toast.SketchFailedSave'));
      dispatch(showToast(1500));
      if (response?.status === 403) {
        dispatch(showErrorModal('staleSession'));
      } else if (response?.status === 409) {
        dispatch(showErrorModal('staleProject'));
      } else {
        dispatch(projectSaveFail(getRequestErrorPayload(error)));
      }
    }
  };
}

export function autosaveProject() {
  return (dispatch, getState) => {
    saveProject(null, true)(dispatch, getState);
  };
}

export function exportProjectAsZip() {
  return async (dispatch, getState) => {
    const { files, project } = getState();
    const entries = editorFilesToZipEntries(files);

    try {
      const zip = new JSZip();

      await Promise.all(
        entries.map(async (entry) => {
          if (entry.url) {
            // Uploaded asset: fetch the bytes from OP storage (S3/CloudFront).
            const res = await fetch(entry.url);
            if (!res.ok) {
              throw new Error(`Failed to fetch ${entry.path}: ${res.status}`);
            }
            zip.file(entry.path, await res.blob());
          } else {
            zip.file(entry.path, entry.content ?? '');
          }
        })
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const filename = `sketch${project.id || project.name || 'export'}.zip`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      dispatch(setToastText('Toast.SketchDownloaded'));
      dispatch(showToast(1500));
    } catch (error) {
      dispatch(setToastText('Toast.SketchFailedDownload'));
      dispatch(showToast(1500));
    }
  };
}

export function resetProject() {
  return {
    type: ActionTypes.RESET_PROJECT
  };
}

export function newProject() {
  browserHistory.push('/', { confirmed: true });
  return resetProject();
}

export function cloneProject(project) {
  return async (dispatch, getState) => {
    dispatch(setUnsavedChanges(false));
    const state = getState();
    const sourceID = project ? project.id : state.project.id;
    const projectName = project ? project.name : state.project.name;

    try {
      const codeRes = await opApiClient.get(`/sketch/${sourceID}/code`);

      const sketchRes = await opApiClient.post('/sketch', {
        title: `${projectName} copy`,
        mode: 'html',
        isPrivate: visibilityToOpPrivacy(state.project.visibility)
      });

      const { visualID } = sketchRes.data;
      const projectId = opVisualIdToProjectId(visualID);

      await Promise.all(
        codeRes.data.map((tab, i) =>
          opApiClient.post(
            `/sketch/${visualID}/code/${encodeURIComponent(tab.title)}`,
            { code: tab.code, orderID: i }
          )
        )
      );

      const { username } = state.user;
      const clonedProject = opSketchToProject(
        { ...sketchRes.data, title: `${projectName} copy` },
        codeRes.data,
        username
      );

      dispatch(setNewProject(clonedProject));
      browserHistory.push(`/${username}/sketches/${projectId}`);
    } catch (error) {
      dispatch({
        type: ActionTypes.PROJECT_SAVE_FAIL,
        error: getRequestErrorPayload(error)
      });
    }
  };
}

export function setProjectSavedTime(updatedAt) {
  return {
    type: ActionTypes.SET_PROJECT_SAVED_TIME,
    value: updatedAt
  };
}

export function changeProjectName(id, newName) {
  return async (dispatch, getState) => {
    try {
      await opApiClient.patch(`/sketch/${id}`, { title: newName });
      dispatch({
        type: ActionTypes.RENAME_PROJECT,
        payload: { id, name: newName }
      });
      const state = getState();
      if (state.project.id === id) {
        dispatch({
          type: ActionTypes.SET_PROJECT_NAME,
          name: newName
        });
      }
    } catch (error) {
      dispatch({
        type: ActionTypes.PROJECT_SAVE_FAIL,
        error: getRequestErrorPayload(error)
      });
    }
  };
}

export function deleteProject(id) {
  return async (dispatch, getState) => {
    try {
      await opApiClient.delete(`/sketch/${id}`);
      const state = getState();
      if (id === state.project.id) {
        dispatch(resetProject());
        dispatch(setPreviousPath('/'));
      }
      dispatch({
        type: ActionTypes.DELETE_PROJECT,
        id
      });
    } catch (error) {
      const { response } = error;
      if (response?.status === 403) {
        dispatch(showErrorModal('staleSession'));
      } else {
        dispatch({
          type: ActionTypes.ERROR,
          error: getRequestErrorPayload(error)
        });
      }
    }
  };
}

export function changeVisibility(projectId, projectName, visibility, t) {
  return async (dispatch, getState) => {
    const state = getState();
    try {
      await opApiClient.patch(`/sketch/${projectId}`, {
        isPrivate: visibilityToOpPrivacy(visibility)
      });

      dispatch({
        type: ActionTypes.CHANGE_VISIBILITY,
        payload: { id: projectId, visibility }
      });

      if (state.project.id === projectId) {
        dispatch({
          type: ActionTypes.SET_PROJECT_VISIBILITY,
          visibility,
          updatedAt: new Date().toISOString()
        });

        dispatch({
          type: ActionTypes.SET_PROJECT_NAME,
          name: projectName
        });

        let visibilityLabel;
        switch (visibility) {
          case 'Public':
            visibilityLabel = t('Visibility.Public.Label');
            break;
          case 'Private':
            visibilityLabel = t('Visibility.Private.Label');
            break;
          default:
            visibilityLabel = visibility;
        }

        const visibilityToastText = t('Visibility.Changed', {
          projectName,
          newVisibility: visibilityLabel.toLowerCase()
        });

        dispatch(setToastText(visibilityToastText));
        dispatch(showToast(2000));
      }
    } catch (error) {
      dispatch({
        type: ActionTypes.ERROR,
        error: getRequestErrorPayload(error)
      });
    }
  };
}
