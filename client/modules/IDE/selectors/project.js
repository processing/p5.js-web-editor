import { createSelector } from '@reduxjs/toolkit';

export const selectProjectOwner = (state) => state.project.owner;
export const selectProjectId = (state) => state.project.id;
export const selectProjectName = (state) => state.project.name;

export const selectSketchPath = createSelector(
  selectProjectOwner,
  selectProjectId,
  (owner, id) => (owner && id ? `/${owner.username}/sketches/${id}` : '/')
);
