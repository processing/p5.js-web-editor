import { createSelector } from '@reduxjs/toolkit';

const selectFiles = (state) => state.files;

export const selectRootFile = createSelector(selectFiles, (files) =>
  files.find((file) => file.name === 'root')
);

export const selectActiveFile = createSelector(
  selectFiles,
  (files) =>
    files.find((file) => file.isSelectedFile) ||
    files.find((file) => file.name === 'sketch.js') ||
    files.find((file) => file.name !== 'root')
);
