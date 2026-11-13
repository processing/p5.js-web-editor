import React from 'react';
import { reduxRender } from '../../../test-utils';
import { setupStore } from '../../../store';
import useSketchActions from './useSketchActions';
import { updateFileContent } from '../actions/files';
import { saveProject, cloneProject } from '../actions/project';
import { openSaveAsCopyModal, showErrorModal } from '../actions/ide';

jest.mock('../actions/project', () => ({
  ...jest.requireActual('../actions/project'),
  saveProject: jest.fn((content) => ({ type: 'TEST_SAVE', content })),
  cloneProject: jest.fn(() => ({ type: 'TEST_CLONE' }))
}));
jest.mock('../actions/files', () => ({
  ...jest.requireActual('../actions/files'),
  updateFileContent: jest.fn((id, content) => ({
    type: 'TEST_UPDATE_FILE',
    id,
    content
  }))
}));

const live = { id: 'file1', name: 'sketch.js', content: 'live code' };
const cmController = { getContent: () => live };

let actions;
const Probe = () => {
  actions = useSketchActions();
  return null;
};

function setup({ authenticated = true, owner } = {}) {
  const store = setupStore({
    user: { authenticated, id: 'me' },
    project: { owner }
  });
  const dispatch = jest.spyOn(store, 'dispatch');
  reduxRender(<Probe />, { store });
  const types = () => dispatch.mock.calls.map(([a]) => a.type);
  return { types };
}

describe('useSketchActions saveSketch', () => {
  let confirmSpy;
  beforeEach(() => {
    jest.clearAllMocks();
    confirmSpy = jest.spyOn(window, 'confirm');
  });
  afterEach(() => confirmSpy.mockRestore());

  it('saves directly when the user owns the sketch', () => {
    const { types } = setup({ owner: { id: 'me' } });
    actions.saveSketch(cmController);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(saveProject).toHaveBeenCalledWith(live);
    expect(types()).toContain('TEST_SAVE');
  });

  it('saves directly for a new sketch with no owner', () => {
    const { types } = setup();
    actions.saveSketch(cmController);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(saveProject).toHaveBeenCalledWith(live);
    expect(types()).toContain('TEST_SAVE');
  });

  it('syncs live content then opens the modal for a non-owner', () => {
    const { types } = setup({ owner: { id: 'someone-else' } });
    actions.saveSketch(cmController);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(updateFileContent).toHaveBeenCalledWith('file1', 'live code');
    expect(cloneProject).not.toHaveBeenCalled();
    expect(saveProject).not.toHaveBeenCalled();
    expect(types()).toEqual(['TEST_UPDATE_FILE', openSaveAsCopyModal().type]);
  });

  it('shows the auth modal when unauthenticated', () => {
    const { types } = setup({ authenticated: false });
    actions.saveSketch(cmController);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(saveProject).not.toHaveBeenCalled();
    expect(types()).toEqual([showErrorModal('forceAuthentication').type]);
  });
});
