import { useMemo } from 'react';
import blobUtil from 'blob-util';
import mime from 'mime';
import { PLAINTEXT_FILE_REGEX } from '../../../server/utils/fileUtils';

// https://gist.github.com/fnky/7d044b94070a35e552f3c139cdf80213
export function useSelectors(state, mapStateToSelectors) {
  const selectors = useMemo(() => mapStateToSelectors(state), [state]);
  return selectors;
}

export function getFileSelectors(state) {
  return {
    getHTMLFile: () => state.filter((file) => file.name.match(/.*\.html$/i))[0],
    getJSFiles: () => state.filter((file) => file.name.match(/.*\.js$/i)),
    getCSSFiles: () => state.filter((file) => file.name.match(/.*\.css$/i))
  };
}

function sortedChildrenId(state, children) {
  const childrenArray = state.filter((file) => children.includes(file.id));
  childrenArray.sort((a, b) => (a.name > b.name ? 1 : -1));
  return childrenArray.map((child) => child.id);
}

export function setFiles(files) {
  return {
    type: 'SET_FILES',
    files
  };
}

export function createBlobUrl(file) {
  if (file.blobUrl) {
    blobUtil.revokeObjectURL(file.blobUrl);
  }

  const mimeType = mime.getType(file.name) || 'text/plain';
  console.log(mimeType);

  const fileBlob = blobUtil.createBlob([file.content], { type: mimeType });
  const blobURL = blobUtil.createObjectURL(fileBlob);
  return blobURL;
}

export function createBlobUrls(state) {
  return state.map((file) => {
    if (file.name.match(PLAINTEXT_FILE_REGEX)) {
      const blobUrl = createBlobUrl(file);
      return { ...file, blobUrl };
    }
    return file;
  });
}

export function filesReducer(state, action) {
  switch (action.type) {
    case 'SET_FILES':
      return createBlobUrls(action.files);
    default:
      return state.map((file) => {
        file.children = sortedChildrenId(state, file.children);
        return file;
      });
  }
}
