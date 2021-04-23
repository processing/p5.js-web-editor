import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import Editor from './Editor';
import { reduxRender } from '../../../test-utils';
import { initialTestState } from '../../../testData/testReduxStore';

jest.mock('../../../i18n');

describe('<Editor />', () => {
  const mockStore = configureStore([thunk]);
  const store = mockStore(initialTestState);

  const subjectProps = { provideController: jest.fn() };

  const subject = () => reduxRender(<Editor {...subjectProps} />, { store });

  afterEach(() => {
    store.clearActions();
  });

  it('renders successfully', () => {
    act(() => {
      subject();
    });
  });
});
