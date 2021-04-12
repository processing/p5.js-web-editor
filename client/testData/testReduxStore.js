const mockProjects = [
  {
    name: 'testsketch1',
    _id: 'testid1',
    updatedAt: '2021-02-26T04:58:29.390Z',
    files: [],
    createdAt: '2021-02-26T04:58:14.136Z',
    id: 'testid1'
  },
  {
    name: 'testsketch2',
    _id: 'testid2',
    updatedAt: '2021-02-23T17:40:43.789Z',
    files: [],
    createdAt: '2021-02-23T17:40:43.789Z',
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
    parentId: undefined
  },
  files: [
    {
      name: 'root',
      id: '606fc1c46045e19ca2ee2648',
      _id: '606fc1c46045e19ca2ee2648',
      children: [
        '606fc1c46045e19ca2ee2646',
        '606fc1c46045e19ca2ee2645',
        '606fc1c46045e19ca2ee2647'
      ],
      fileType: 'folder',
      content: ''
    },
    {
      name: 'sketch.js',
      content:
        'function setup() { createCanvas(400, 400); } function draw() { background(220); }',
      id: '606fc1c46045e19ca2ee2645',
      _id: '606fc1c46045e19ca2ee2645',
      isSelectedFile: true,
      fileType: 'file',
      children: []
    },
    {
      name: 'index.html',
      content: `<!DOCTYPE html> <html lang="en"> <head> <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.2.0/p5.js"></script> <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.2.0/addons/p5.sound.min.js"></script> <link rel="stylesheet" type="text/css" href="style.css"> <meta charset="utf-8" /> </head> <body> <script src="sketch.js"></script> </body> </html>`,
      id: '606fc1c46045e19ca2ee2646',
      _id: '606fc1c46045e19ca2ee2646',
      fileType: 'file',
      children: []
    },
    {
      name: 'style.css',
      content:
        'html, body { margin: 0; padding: 0; } canvas { display: block; } ',
      id: '606fc1c46045e19ca2ee2647',
      _id: '606fc1c46045e19ca2ee2647',
      fileType: 'file',
      children: []
    }
  ],
  preferences: {
    fontSize: 18,
    autosave: true,
    linewrap: true,
    lineNumbers: true,
    lintWarning: false,
    textOutput: false,
    gridOutput: false,
    soundOutput: false,
    theme: 'light',
    autorefresh: false,
    language: 'en-US',
    autocloseBracketsQuotes: true
  },
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
