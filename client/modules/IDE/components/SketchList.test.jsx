import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import moxios from 'moxios';
import * as ProjectActions from '../actions/projects';
import * as ActionTypes from '../../../constants';
import SketchList from './SketchList';
import { reduxRender, fireEvent, screen } from '../../../test-utils';

const mockStore = configureStore([thunk]);

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

describe('<Sketchlist />', () => {
  let container = null;
  let store;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
    store.clearActions();
  });

  // it('creates GET_PROJECTS after successfuly fetching projects', async () => {
  //   moxios.install();
  //   function resolveAfter2Seconds() {
  //     console.log("called resolve");
  //     return new Promise(resolve => {
  //       setTimeout(() => {
  //         resolve('resolved');
  //       }, 5000);
  //     });
  //   }
  //   console.log("moxios", moxios);
  //   moxios.wait(() => {

  //     const request = moxios.requests.mostRecent();
  //     console.log(moxios.requests, request)
  //     console.log("recieved request for get projects")
  //     request.respondWith({
  //       status: 200,
  //       response: mockProjects,
  //     }).then(() => done());
  //   });

  //   const expectedActions = [
  //     {type: ActionTypes.START_LOADING},
  //     { type: ActionTypes.SET_PROJECTS,
  //       projects: mockProjects }
  //   ];

  //   store = mockStore(initialTestState);
  //   console.log("dispatching action");
  //   //store.dispatch(ProjectActions.getProjects("happydog"))
  //   act(() => {
  //     reduxRender(<SketchList />, { store, container });
  //   });

  //   const hasSetProjectKey = (currActions) => {
  //     return currActions.filter(ac => ac.type === ActionTypes.SET_PROJECTS).length > 0;
  //   }

  //   await waitFor(() => expect(hasSetProjectKey(store.getActions())).toEqual(true));
  //   moxios.uninstall();
  //   //expect(store.getActions()).toEqual(expectedActions);
  //   //return resolveAfter2Seconds().then(res => console.log("resolved"))
  // });

  it('has both of the sample projects', () => {
    store = mockStore(initialTestState);
    let component;
    act(() => {
      component = reduxRender(<SketchList />, { store, container });
    });
    expect(screen.getByText('testsketch1')).toBeInTheDocument();
    expect(screen.getByText('testsketch2')).toBeInTheDocument();
  });

  it('clicking on date created row header dispatches a reordering action', () => {
    store = mockStore(initialTestState);
    let component;
    act(() => {
      component = reduxRender(<SketchList />, { store, container });
    });
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-direction-createdAt'));
    });
    const expectedAction = [{ type: 'TOGGLE_DIRECTION', field: 'createdAt' }];
    expect(store.getActions()).toEqual(expect.arrayContaining(expectedAction));
  });
});
