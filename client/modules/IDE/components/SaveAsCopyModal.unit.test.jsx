import React from 'react';
import { reduxRender, fireEvent, screen } from '../../../test-utils';
import { setupStore } from '../../../store';
import SaveAsCopyModal from './SaveAsCopyModal';
import { cloneProject } from '../actions/project';

jest.mock('../../../i18n');
jest.mock('../actions/project', () => ({
  ...jest.requireActual('../actions/project'),
  cloneProject: jest.fn(() => ({ type: 'TEST_CLONE' }))
}));

function setup() {
  const store = setupStore();
  const dispatch = jest.spyOn(store, 'dispatch');
  reduxRender(<SaveAsCopyModal />, { store });
  const types = () => dispatch.mock.calls.map(([a]) => a.type);
  return { types };
}

describe('<SaveAsCopyModal />', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders title, text and buttons', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Save a copy?' })).toBeVisible();
    expect(screen.getByText(/You don't own this sketch/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save a copy' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('closes and clones on confirm', () => {
    const { types } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Save a copy' }));
    expect(cloneProject).toHaveBeenCalledTimes(1);
    expect(types()).toEqual(['CLOSE_SAVE_AS_COPY_MODAL', 'TEST_CLONE']);
  });

  it('closes without cloning on cancel', () => {
    const { types } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(cloneProject).not.toHaveBeenCalled();
    expect(types()).toEqual(['CLOSE_SAVE_AS_COPY_MODAL']);
  });

  it('closes without cloning from the exit button', () => {
    const { types } = setup();
    fireEvent.click(
      screen.getByRole('button', { name: 'Close Save a copy? overlay' })
    );
    expect(cloneProject).not.toHaveBeenCalled();
    expect(types()).toEqual(['CLOSE_SAVE_AS_COPY_MODAL']);
  });
});
