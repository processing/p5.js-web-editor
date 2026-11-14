import projects from './projects';
import * as ActionTypes from '../../../constants';

describe('projects reducer', () => {
  it('preserves list metadata when deleting a project', () => {
    const state = { projects: [{ id: 'one' }, { id: 'two' }], totalCount: 2 };
    expect(projects(state, { type: ActionTypes.DELETE_PROJECT, id: 'one' })).toEqual({
      projects: [{ id: 'two' }],
      totalCount: 2
    });
  });

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
