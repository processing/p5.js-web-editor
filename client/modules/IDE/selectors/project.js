import { createSelector } from 'reselect';

export const selectProjectOwner = (state) => state.project.owner;
export const selectProjectId = (state) => state.project.id;

export const selectSketchPath = createSelector(
  selectProjectOwner,
  selectProjectId,
  (owner, id) => (owner && id ? `/${owner.username}/sketches/${id}` : '/')
);
