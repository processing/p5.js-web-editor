import createSelector from 'reselect';

const getFiles = (state) => state.sketches;

const getSelectedFile = createSelector(
  getFiles,
  (files) =>
    files.find((file) => file.isSelectedFile) ||
    files.find((file) => file.name === 'sketch.js') ||
    files.find((file) => file.name !== 'root')
);

export default getSelectedFile;
