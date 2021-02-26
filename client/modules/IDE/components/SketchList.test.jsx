import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { reduxRender, prettyDOM } from '../../../test-utils';
import SketchList from './SketchList';

const mockStore = configureStore([thunk]);

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
  sketches: [
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
  ],
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

describe('<Sketchlist />', () => {
  let container = null;
  let store;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement('div');
    document.body.appendChild(container);
    store = mockStore(initialTestState);
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  describe('<SketchListRow />', () => {
    it('render', () => {
      let component;
      // render the component with autosave set to false as default
      act(() => {
        component = reduxRender(<SketchList />, { store, container });
      });
      console.log(prettyDOM(container));
    });
  });
});
