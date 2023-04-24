import * as ActionTypes from '../../../constants';
import { clearConsole } from './console';
import { dispatchMessage, MessageTypes } from '../../../utils/dispatcher';

import { ideActions } from '../reducers/ide';

// TODO: refactor actions which are only used internally by other actions.
const {
  startVisualSketch,
  stopVisualSketch,
  startRefreshSketch,
  startAccessibleOutput,
  stopAccessibleOutput,
  showShareModal: showShareModalInternal
} = ideActions;

export const {
  openUploadFileModal,
  closeUploadFileModal,
  hideRuntimeErrorWarning,
  showRuntimeErrorWarning,
  setUnsavedChanges,
  endSketchRefresh, // TODO: export is not actually needed
  newFile,
  closeNewFileModal,
  newFolder,
  closeNewFolderModal,
  expandSidebar,
  collapseSidebar,
  expandConsole,
  collapseConsole,
  openPreferences,
  closePreferences,
  openProjectOptions,
  closeProjectOptions,
  closeShareModal,
  showKeyboardShortcutModal,
  closeKeyboardShortcutModal,
  showErrorModal,
  hideErrorModal,
  setPreviousPath,
  justOpenedProject,
  resetJustOpenedProject
} = ideActions;

// TODO: move to /files
export function setSelectedFile(fileId) {
  return {
    type: ActionTypes.SET_SELECTED_FILE,
    selectedFile: fileId
  };
}

// TODO: move to /files
export function resetSelectedFile(previousId) {
  return (dispatch, getState) => {
    const state = getState();
    const newId = state.files.find(
      (file) => file.name !== 'root' && file.id !== previousId
    ).id;
    dispatch(setSelectedFile(newId));
  };
}

export function showShareModal(projectId, projectName, ownerUsername) {
  return (dispatch, getState) => {
    const { project, user } = getState();
    dispatch(
      showShareModalInternal({
        shareModalProjectId: projectId || project.id,
        shareModalProjectName: projectName || project.name,
        shareModalProjectUsername: ownerUsername || user.username
      })
    );
  };
}

export function startSketch() {
  return (dispatch, getState) => {
    dispatch(clearConsole());
    dispatch(startVisualSketch());
    dispatch(showRuntimeErrorWarning());
    const state = getState();
    dispatchMessage({
      type: MessageTypes.SKETCH,
      payload: {
        files: state.files,
        basePath: window.location.pathname,
        gridOutput: state.preferences.gridOutput,
        textOutput: state.preferences.textOutput
      }
    });
    dispatchMessage({
      type: MessageTypes.START
    });
  };
}

// TODO: does this need to call dispatchMessage like in startSketch? Should it call startSketch internally?
export function startAccessibleSketch() {
  return (dispatch) => {
    dispatch(clearConsole());
    dispatch(startAccessibleOutput());
    dispatch(startVisualSketch());
    dispatch(startRefreshSketch());
  };
}

export function stopSketch() {
  return (dispatch) => {
    dispatchMessage({
      type: MessageTypes.STOP
    });
    dispatch(stopAccessibleOutput());
    dispatch(stopVisualSketch());
  };
}

// TODO: move to /files
export function createError(error) {
  return {
    type: ActionTypes.ERROR,
    error
  };
}
