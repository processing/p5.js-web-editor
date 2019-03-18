import ide from '../ide';
import * as actions from '../../../../constants';

const initialState = {
  isPlaying: false,
  isAccessibleOutputPlaying: false,
  modalIsVisible: false,
  sidebarIsExpanded: false,
  consoleIsExpanded: true,
  preferencesIsVisible: false,
  projectOptionsVisible: false,
  newFolderModalVisible: false,
  shareModalVisible: false,
  editorOptionsVisible: false,
  keyboardShortcutVisible: false,
  unsavedChanges: false,
  infiniteLoop: false,
  previewIsRefreshing: false,
  infiniteLoopMessage: '',
  justOpenedProject: false,
  previousPath: '/',
  errorType: undefined,
  runtimeErrorWarningVisible: true,
};

describe('ide reducer', () => {
  it('should return the initial state', () => {
    expect(ide(undefined, {})).toEqual(initialState);
  });

  it('should handle START_SKETCH', () => {
    const startSketch = {
      type: actions.START_SKETCH
    };
    expect(ide({}, startSketch)).toEqual({ isPlaying: true });
  });
});
