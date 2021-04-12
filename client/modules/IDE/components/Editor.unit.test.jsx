import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import Editor from './Editor';
import {
  reduxRender,
  fireEvent,
  screen,
  within,
  prettyDOM
} from '../../../test-utils';
import { initialTestState } from '../../../redux_test_stores/test_store';

jest.mock('../../../i18n');

describe('<Editor />', () => {
  const mockStore = configureStore([thunk]);
  const store = mockStore(initialTestState);

  const subjectProps = { provideController: jest.fn() };

  const subject = () => reduxRender(<Editor {...subjectProps} />, { store });

  beforeEach(() => {
    axios.get.mockImplementationOnce((x) => Promise.resolve({ data: 'foo' }));
  });

  afterEach(() => {
    store.clearActions();
  });

  it('renders successfully', () => {
    act(() => {
      subject();
    });
  });
});