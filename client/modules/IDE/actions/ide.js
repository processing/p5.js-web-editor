import * as ActionTypes from '../../../constants';
import { clearConsole } from './console';

export function startVisualSketch() {
  return {
    type: ActionTypes.START_SKETCH
  };
}

export function stopVisualSketch() {
  return {
    type: ActionTypes.STOP_SKETCH
  };
}

export function startRefreshSketch() {
  return {
    type: ActionTypes.START_SKETCH_REFRESH
  };
}

export function startSketchAndRefresh() {
  return (dispatch) => {
    dispatch(startVisualSketch());
    dispatch(startRefreshSketch());
  };
}

export function endSketchRefresh() {
  return {
    type: ActionTypes.END_SKETCH_REFRESH
  };
}

export function startAccessibleOutput() {
  return {
    type: ActionTypes.START_ACCESSIBLE_OUTPUT
  };
}

export function stopAccessibleOutput() {
  return {
    type: ActionTypes.STOP_ACCESSIBLE_OUTPUT
  };
}

export function setSelectedFile(fileId) {
  return {
    type: ActionTypes.SET_SELECTED_FILE,
    selectedFile: fileId
  };
}

export function resetSelectedFile(previousId) {
  return (dispatch, getState) => {
    const state = getState();
    const newId = state.files.find(file => file.name !== 'root' && file.id !== previousId).id;
    dispatch({
      type: ActionTypes.SET_SELECTED_FILE,
      selectedFile: newId
    });
  };
}

export function newFile() {
  return {
    type: ActionTypes.SHOW_MODAL
  };
}

export function closeNewFileModal() {
  return {
    type: ActionTypes.HIDE_MODAL
  };
}

export function expandSidebar() {
  return {
    type: ActionTypes.EXPAND_SIDEBAR
  };
}

export function collapseSidebar() {
  return {
    type: ActionTypes.COLLAPSE_SIDEBAR
  };
}

export function expandConsole() {
  return {
    type: ActionTypes.EXPAND_CONSOLE
  };
}

export function collapseConsole() {
  return {
    type: ActionTypes.COLLAPSE_CONSOLE
  };
}

export function openPreferences() {
  return {
    type: ActionTypes.OPEN_PREFERENCES
  };
}

export function closePreferences() {
  return {
    type: ActionTypes.CLOSE_PREFERENCES
  };
}

export function openProjectOptions() {
  return {
    type: ActionTypes.OPEN_PROJECT_OPTIONS
  };
}

export function closeProjectOptions() {
  return {
    type: ActionTypes.CLOSE_PROJECT_OPTIONS
  };
}

export function newFolder() {
  return {
    type: ActionTypes.SHOW_NEW_FOLDER_MODAL
  };
}

export function closeNewFolderModal() {
  return {
    type: ActionTypes.CLOSE_NEW_FOLDER_MODAL
  };
}

export function showShareModal(projectId, projectName, ownerUsername) {
  return (dispatch, getState) => {
    const { project, user } = getState();
    dispatch({
      type: ActionTypes.SHOW_SHARE_MODAL,
      payload: {
        shareModalProjectId: projectId || project.id,
        shareModalProjectName: projectName || project.name,
        shareModalOwnerUsername: ownerUsername || user.username
      }
    });
  };
}

export function closeShareModal() {
  return {
    type: ActionTypes.CLOSE_SHARE_MODAL
  };
}

export function showEditorOptions() {
  return {
    type: ActionTypes.SHOW_EDITOR_OPTIONS
  };
}

export function closeEditorOptions() {
  return {
    type: ActionTypes.CLOSE_EDITOR_OPTIONS
  };
}

export function showKeyboardShortcutModal() {
  return {
    type: ActionTypes.SHOW_KEYBOARD_SHORTCUT_MODAL
  };
}

export function closeKeyboardShortcutModal() {
  return {
    type: ActionTypes.CLOSE_KEYBOARD_SHORTCUT_MODAL
  };
}

export function setUnsavedChanges(value) {
  return {
    type: ActionTypes.SET_UNSAVED_CHANGES,
    value
  };
}

export function detectInfiniteLoops(message) {
  return {
    type: ActionTypes.DETECT_INFINITE_LOOPS,
    message
  };
}

export function resetInfiniteLoops() {
  return {
    type: ActionTypes.RESET_INFINITE_LOOPS
  };
}

export function justOpenedProject() {
  return {
    type: ActionTypes.JUST_OPENED_PROJECT,
  };
}

export function resetJustOpenedProject() {
  return {
    type: ActionTypes.RESET_JUST_OPENED_PROJECT
  };
}

export function setPreviousPath(path) {
  return {
    type: ActionTypes.SET_PREVIOUS_PATH,
    path
  };
}

export function showErrorModal(modalType) {
  return {
    type: ActionTypes.SHOW_ERROR_MODAL,
    modalType
  };
}

export function hideErrorModal() {
  return {
    type: ActionTypes.HIDE_ERROR_MODAL
  };
}

export function showHelpModal(helpType) {
  return {
    type: ActionTypes.SHOW_HELP_MODAL,
    helpType
  };
}

export function hideHelpModal() {
  return {
    type: ActionTypes.HIDE_HELP_MODAL
  };
}

export function hideRuntimeErrorWarning() {
  return {
    type: ActionTypes.HIDE_RUNTIME_ERROR_WARNING
  };
}

export function showRuntimeErrorWarning() {
  return {
    type: ActionTypes.SHOW_RUNTIME_ERROR_WARNING
  };
}

export function startSketch() {
  return (dispatch) => {
    dispatch(clearConsole());
    dispatch(startSketchAndRefresh());
  };
}

export function startAccessibleSketch() {
  return (dispatch) => {
    dispatch(clearConsole());
    dispatch(startAccessibleOutput());
    dispatch(startSketchAndRefresh());
  };
}

export function stopSketch() {
  return (dispatch) => {
    dispatch(stopAccessibleOutput());
    dispatch(stopVisualSketch());
  };
}
