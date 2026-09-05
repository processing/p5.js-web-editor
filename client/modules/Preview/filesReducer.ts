import blobUtil from 'blob-util';
import mime from 'mime';
import { PLAINTEXT_FILE_REGEX } from '../../../server/utils/fileUtils';

export interface PreviewFile {
  id: string;
  name: string;
  content?: string;
  blobUrl?: string;
  url?: string;
  children: string[];
  fileType: 'file' | 'folder';
}

export interface SetFilesAction {
  type: 'SET_FILES';
  files: PreviewFile[];
}

export type FilesReducerAction = SetFilesAction;

export function setFilesAction(files: PreviewFile[]) {
  return {
    type: 'SET_FILES' as const,
    files
  };
}

function sortedChildrenId(state: PreviewFile[], children: string[]) {
  const childrenArray = state.filter((file) => children.includes(file.id));
  childrenArray.sort((a, b) => (a.name > b.name ? 1 : -1));
  return childrenArray.map((child) => child.id);
}

export function createBlobUrl(file: PreviewFile) {
  if (file.blobUrl) {
    blobUtil.revokeObjectURL(file.blobUrl);
  }

  const mimeType = mime.lookup(file.name) || 'text/plain';
  const fileBlob = blobUtil.createBlob([file.content ?? ''], {
    type: mimeType
  });
  const blobURL = blobUtil.createObjectURL(fileBlob);
  return blobURL;
}

export function createBlobUrls(state: PreviewFile[]) {
  return state.map((file) => {
    if (file.name.match(PLAINTEXT_FILE_REGEX)) {
      const blobUrl = createBlobUrl(file);
      return { ...file, blobUrl };
    }
    return file;
  });
}

export function filesReducer(state: PreviewFile[], action: FilesReducerAction) {
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
