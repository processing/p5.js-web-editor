import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import SketchList from './SketchList';
import { reduxRender, fireEvent, screen } from '../../../test-utils';
import {
  initialTestState,
  mockProjects
} from '../../../redux_test_stores/test_store';

jest.mock('../../../i18n');

/*
 * there seem to be polarizing opinions about whether or not
 * we should test the unconnected component or the
 * connected one. For the sake of not editing the original SketchList file
 * with an unneccessary export statement, I'm testing
 * the connected component with redux-mock-store.
 * this approach is outlined here -
 * https://www.robinwieruch.de/react-connected-component-test
 */

describe('<Sketchlist />', () => {
  let store;
  let container;
  const mockStore = configureStore([thunk]);

  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement('div');
    document.body.appendChild(container);
    axios.get.mockImplementationOnce((x) => Promise.resolve({ data: 'foo' }));
    store = mockStore(initialTestState);
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
    store.clearActions();
  });

  it('has sample projects', () => {
    let component;
    act(() => {
      component = reduxRender(<SketchList username="happydog1" />, {
        store,
        container
      });
    });
    expect(screen.getByText('testsketch1')).toBeInTheDocument();
    expect(screen.getByText('testsketch2')).toBeInTheDocument();
  });

  it('clicking on date created row header dispatches a reordering action', () => {
    let component;
    act(() => {
      component = reduxRender(<SketchList username="happydog2" />, {
        store,
        container
      });
    });
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-direction-createdAt'));
    });
    const expectedAction = [{ type: 'TOGGLE_DIRECTION', field: 'createdAt' }];
    expect(store.getActions()).toEqual(expect.arrayContaining(expectedAction));
  });

  it('clicking on dropdown arrow opens sketch options', () => {
    let component;
    act(() => {
      component = reduxRender(<SketchList username="happydog2" />, {
        store,
        container
      });
    });
    const dropdown = screen.queryAllByTestId(
      'sketch-list-toggle-options-arrow'
    );

    if (dropdown.length > 0) {
      act(() => {
        fireEvent.click(dropdown[0]);
      });

      expect(screen.queryByText('Rename')).not.toBeInTheDocument();
      expect(screen.queryByText('Duplicate')).toBeInTheDocument();
      expect(screen.queryByText('Download')).toBeInTheDocument();
      expect(screen.queryByText('Add to collection')).toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    }
  });

  it('clicking on dropdown arrow opens sketch options - sketches belong to user', () => {
    let component;
    act(() => {
      component = reduxRender(<SketchList username="happydog" />, {
        store,
        container
      });
    });
    const dropdown = screen.queryAllByTestId(
      'sketch-list-toggle-options-arrow'
    );

    if (dropdown.length > 0) {
      act(() => {
        fireEvent.click(dropdown[0]);
      });

      expect(screen.queryByText('Rename')).toBeInTheDocument();
      expect(screen.queryByText('Duplicate')).toBeInTheDocument();
      expect(screen.queryByText('Download')).toBeInTheDocument();
      expect(screen.queryByText('Add to collection')).toBeInTheDocument();
      expect(screen.queryByText('Delete')).toBeInTheDocument();
    }
  });

  it('snapshot testing', () => {
    const { asFragment } = reduxRender(<SketchList username="happydog2" />, {
      store,
      container
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
