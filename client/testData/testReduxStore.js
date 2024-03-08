import { initialState as initialFilesState } from '../modules/IDE/reducers/files';
import { initialState as initialPrefState } from '../modules/IDE/reducers/preferences';

const mockProjects = [
  {
    name: 'testsketch1',
    _id: 'testid1',
    updatedAt: '2021-02-26T04:58:29',
    files: [],
    createdAt: '2021-02-26T04:58:14',
    id: 'testid1'
  },
  {
    name: 'testsketch2',
    _id: 'testid2',
    updatedAt: '2021-02-23T17:40:43',
    files: [],
    createdAt: '2021-02-23T17:40:43',
    id: 'testid2'
  }
];

const initialTestState = {
  ide: {
    isPlaying: false,
    isAccessibleOutputPlaying: false,
    modalIsVisible: false,
    sidebarIsExpanded: false,
    consoleIsExpanded: true,
    preferencesIsVisible: false,
    projectOptionsVisible: false,
    newFolderModalVisible: false,
    uploadFileModalVisible: false,
    shareModalVisible: false,
    shareModalProjectId: 'abcd',
    shareModalProjectName: 'My Cute Sketch',
    shareModalProjectUsername: 'p5_user',
    keyboardShortcutVisible: false,
    unsavedChanges: false,
    infiniteLoop: false,
    previewIsRefreshing: false,
    infiniteLoopMessage: '',
    justOpenedProject: false,
    previousPath: '/',
    errorType: undefined,
    runtimeErrorWarningVisible: true,
    parentId: undefined
  },
  files: initialFilesState(),
  preferences: initialPrefState,
  user: {
    email: 'happydog@example.com',
    username: 'happydog',
    preferences: {},
    apiKeys: [],
    verified: 'sent',
    id: '123456789',
    totalSize: 0,
    authenticated: true
  },
  project: {
    name: 'Zealous sunflower',
    updatedAt: '',
    isSaving: false
  },
  sketches: mockProjects,
  search: {
    collectionSearchTerm: '',
    sketchSearchTerm: ''
  },
  sorting: {
    field: 'createdAt',
    direction: 'DESCENDING'
  },
  editorAccessibility: {
    lintMessages: [],
    forceDesktop: false
  },
  toast: {
    isVisible: false,
    text: ''
  },
  console: [],
  assets: {
    list: [],
    totalSize: 0
  },
  loading: false,
  collections: []
};

export { mockProjects, initialTestState };
