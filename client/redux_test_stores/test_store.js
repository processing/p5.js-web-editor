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
  ide: null,
  files: [],
  preferences: {},
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
  project: null,
  sketches: mockProjects,
  search: {
    collectionSearchTerm: '',
    sketchSearchTerm: ''
  },
  sorting: {
    field: 'createdAt',
    direction: 'DESCENDING'
  },
  editorAccessibility: {},
  toast: {},
  console: [],
  assets: {},
  loading: false,
  collections: []
};

export { mockProjects, initialTestState };
