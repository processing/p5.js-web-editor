import projects from './projects';
import * as ActionTypes from '../../../constants';

describe('projects reducer', () => {
  it.each([
    {
      type: ActionTypes.CHANGE_VISIBILITY,
      payload: { id: 'project', visibility: 'Private' }
    },
    { type: ActionTypes.DELETE_PROJECT, id: 'project' },
    {
      type: ActionTypes.RENAME_PROJECT,
      payload: { id: 'project', name: 'Renamed' }
    }
  ])('ignores $type before the project list loads', (action) => {
    const state = [];
    expect(projects(state, action)).toBe(state);
  });
});
