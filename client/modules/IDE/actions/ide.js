import * as ActionTypes from '../../../constants';

export function toggleSketch() {
  return {
    type: ActionTypes.TOGGLE_SKETCH
  };
}

export function startSketch() {
  return {
    type: ActionTypes.START_SKETCH
  };
}

export function stopSketch() {
  return {
    type: ActionTypes.STOP_SKETCH
  };
}

export function startTextOutput() {
  return {
    type: ActionTypes.START_TEXT_OUTPUT
  };
}

export function stopTextOutput() {
  return {
    type: ActionTypes.STOP_TEXT_OUTPUT
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

export function dispatchConsoleEvent(...args) {
  return {
    type: ActionTypes.CONSOLE_EVENT,
    event: args[0].data
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
