import projects from './projects';
import * as ActionTypes from '../../../constants';

describe('projects reducer', () => {
  it('ignores visibility updates before the project list loads', () => {
    const state = [];
    expect(
      projects(state, {
        type: ActionTypes.CHANGE_VISIBILITY,
        payload: { id: 'project', visibility: 'Private' }
      })
    ).toBe(state);
  });
});
