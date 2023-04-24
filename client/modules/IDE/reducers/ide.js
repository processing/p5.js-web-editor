import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isPlaying: false,
  // TODO: this doesn't do anything.
  isAccessibleOutputPlaying: false,
  // TODO: rename ambiguous property
  modalIsVisible: false,
  sidebarIsExpanded: false,
  consoleIsExpanded: true,
  preferencesIsVisible: false,
  projectOptionsVisible: false,
  newFolderModalVisible: false,
  uploadFileModalVisible: false,
  // TODO: nested properties instead of all at top-level
  shareModalVisible: false,
  shareModalProjectId: 'abcd',
  shareModalProjectName: 'My Cute Sketch',
  shareModalProjectUsername: 'p5_user',
  keyboardShortcutVisible: false,
  unsavedChanges: false,
  // TODO: remove dead code, see: PR #849 and issue #698
  infiniteLoop: false,
  previewIsRefreshing: false,
  infiniteLoopMessage: '',
  justOpenedProject: false,
  previousPath: '/',
  errorType: undefined,
  runtimeErrorWarningVisible: false,
  parentId: undefined
};

const ideSlice = createSlice({
  name: 'ide',
  initialState,
  reducers: {
    startVisualSketch: (state) => {
      state.isPlaying = true;
    },
    stopVisualSketch: (state) => {
      state.isPlaying = false;
    },
    startAccessibleOutput: (state) => {
      state.isAccessibleOutputPlaying = true;
    },
    stopAccessibleOutput: (state) => {
      state.isAccessibleOutputPlaying = false;
    },
    consoleEvent: (state, action) => {
      state.consoleEvent = action.payload;
    },
    collapseSidebar: (state) => {
      state.sidebarIsExpanded = false;
    },
    expandSidebar: (state) => {
      state.sidebarIsExpanded = true;
    },
    collapseConsole: (state) => {
      state.consoleIsExpanded = false;
    },
    expandConsole: (state) => {
      state.consoleIsExpanded = true;
    },
    openPreferences: (state) => {
      state.preferencesIsVisible = true;
    },
    closePreferences: (state) => {
      state.preferencesIsVisible = false;
    },
    openProjectOptions: (state) => {
      state.projectOptionsVisible = true;
    },
    closeProjectOptions: (state) => {
      state.projectOptionsVisible = false;
    },
    resetProject: () => initialState,
    // TODO: rename to openNewFileModal or showNewFileModal
    newFile: (state, action) => {
      state.modalIsVisible = true;
      // TODO: nested properties
      state.parentId = action.payload;
      state.newFolderModalVisible = false;
    },
    closeNewFileModal: (state) => {
      state.modalIsVisible = false;
    },
    // TODO: rename to openNewFolderModal or showNewFolderModal
    newFolder: (state, action) => {
      state.newFolderModalVisible = true;
      state.parentId = action.payload;
      state.modalIsVisible = false;
    },
    closeNewFolderModal: (state) => {
      state.newFolderModalVisible = false;
    },
    openUploadFileModal: (state, action) => {
      state.uploadFileModalVisible = true;
      state.parentId = action.payload;
    },
    closeUploadFileModal: (state) => {
      state.uploadFileModalVisible = false;
    },
    showShareModal: (state, action) => {
      state.shareModalVisible = true;
      state.shareModalProjectId = action.payload.shareModalProjectId;
      state.shareModalProjectName = action.payload.shareModalProjectName;
      state.shareModalProjectUsername =
        action.payload.shareModalProjectUsername;
    },
    closeShareModal: (state) => {
      state.shareModalVisible = false;
    },
    showKeyboardShortcutModal: (state) => {
      state.keyboardShortcutVisible = true;
    },
    closeKeyboardShortcutModal: (state) => {
      state.keyboardShortcutVisible = false;
    },
    showErrorModal: (state, action) => {
      state.errorType = action.payload;
    },
    hideErrorModal: (state) => {
      state.errorType = undefined;
    },
    setUnsavedChanges: (state, action) => {
      state.unsavedChanges = action.payload;
    },
    detectInfiniteLoops: (state, action) => {
      state.infiniteLoop = true;
      state.infiniteLoopMessage = action.payload;
    },
    resetInfiniteLoops: (state) => {
      state.infiniteLoop = false;
      state.infiniteLoopMessage = '';
    },
    startRefreshSketch: (state) => {
      state.previewIsRefreshing = true;
    },
    endSketchRefresh: (state) => {
      state.previewIsRefreshing = false;
    },
    justOpenedProject: (state) => {
      state.justOpenedProject = true;
    },
    resetJustOpenedProject: (state) => {
      state.justOpenedProject = false;
    },
    setPreviousPath: (state, action) => {
      state.previousPath = action.payload;
    },
    showRuntimeErrorWarning: (state) => {
      state.runtimeErrorWarningVisible = true;
    },
    hideRuntimeErrorWarning: (state) => {
      state.runtimeErrorWarningVisible = false;
    }
  }
});

export const ideActions = ideSlice.actions;

export default ideSlice.reducer;
