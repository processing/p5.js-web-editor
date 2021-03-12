import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import * as ProjectActions from '../projects';
import * as ActionTypes from '../../../../constants';
import {
  initialTestState,
  mockProjects
} from '../../../../redux_test_stores/test_store';

// look into this
// https://willowtreeapps.com/ideas/best-practices-for-unit-testing-with-a-react-redux-approach

const mockStore = configureStore([thunk]);

describe('projects action creator tests', () => {
  let store;

  afterEach(() => {
    store.clearActions();
  });

  it('creates GET_PROJECTS after successfuly fetching projects', () => {
    store = mockStore(initialTestState);

    axios.get.mockImplementationOnce((x) => {
      console.log('get was called with ', x);
      return Promise.resolve({ data: mockProjects });
    });

    const expectedActions = [
      { type: ActionTypes.START_LOADING },
      { type: ActionTypes.SET_PROJECTS, projects: mockProjects },
      { type: ActionTypes.STOP_LOADING }
    ];

    return store
      .dispatch(ProjectActions.getProjects('happydog'))
      .then(() => expect(store.getActions()).toEqual(expectedActions));
  });
});
