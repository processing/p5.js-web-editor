import axios from 'axios';
import objectID from 'bson-objectid';
import blobUtil from 'blob-util';
import { reset } from 'redux-form';
import * as ActionTypes from '../../../constants';
import { setUnsavedChanges } from './ide';

const __process = (typeof global !== 'undefined' ? global : window).process;
const ROOT_URL = __process.env.API_URL;

function appendToFilename(filename, string) {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return filename + string;
  return filename.substring(0, dotIndex) + string + filename.substring(dotIndex);
}

function createUniqueName(name, parentId, files) {
  console.log('cun');
  console.log(name);
  console.log(parentId);
  console.log(files);
  const siblingFiles = files.find(file => file.id === parentId)
    .children.map(childFileId => files.find(file => file.id === childFileId));
  console.log(siblingFiles);
  let testName = name;
  let index = 1;
  let existingName = siblingFiles.find(file => name === file.name);

  while (existingName) {
    testName = appendToFilename(name, `-${index}`);
    index += 1;
    existingName = siblingFiles.find((file) => testName === file.name); // eslint-disable-line
  }
  console.log(testName);
  return testName;
}

export function updateFileContent(name, content) {
  return {
    type: ActionTypes.UPDATE_FILE_CONTENT,
    name,
    content
  };
}

export function createFile(formProps) {
  return (dispatch, getState) => {
    const state = getState();
    const selectedFile = state.files.find(file => file.isSelectedFile);
    const rootFile = state.files.find(file => file.name === 'root');
    let parentId;
    const relativePath = formProps.name;
    const relativePathSplit = relativePath.split('/');
    const parentFolders = relativePath.length === 1 ? [] : relativePathSplit.slice(0, -1);
    const fileName = relativePathSplit.slice(-1)[0];
    console.log(fileName);
    console.log(parentFolders);
    if (selectedFile.fileType === 'folder') {
      parentId = selectedFile.id;
    } else {
      parentId = rootFile.id;
    }
    parentId = parentFolders.reduce((parentFolderId, currentFolderName) => {
      const { files } = state;
      const parentFolderObject = files.find(file => file.id === parentFolderId);
      console.log(parentFolderObject);
      const childFoldersObject = parentFolderObject.children.map(childFileId => files.find(file => file.id === childFileId));
      const currentFolderObject = childFoldersObject.find(childFile => childFile.name === currentFolderName);
      const currentFolderId = currentFolderObject ? currentFolderObject.id : undefined;

      if (!currentFolderId) {
        if (state.project.id) {
          const postParams = {
            name: createUniqueName(currentFolderName, parentFolderId, state.files),
            content: '',
            children: [],
            parentId: parentFolderId,
            fileType: 'folder'
          };
          axios.post(`${ROOT_URL}/projects/${state.project.id}/files`, postParams, { withCredentials: true })
            .then((response) => {
              dispatch({
                type: ActionTypes.CREATE_FILE,
                ...response.data,
                parentId: parentFolderId
              });
              dispatch({
                type: ActionTypes.CLOSE_NEW_FOLDER_MODAL
              });
            })
            .catch(response => dispatch({
              type: ActionTypes.ERROR,
              error: response.data
            }));
        } else {
          const id = objectID().toHexString();
          console.log(state.files);
          dispatch({
            type: ActionTypes.CREATE_FILE,
            /* name: createUniqueName(currentFolderName, parentFolderId, state.files), */
            name: currentFolderName,
            id,
            _id: id,
            content: '',
            // TODO pass parent id from File Tree
            parentId: parentFolderId,
            fileType: 'folder',
            children: []
          });
          return id;
        }
      }
      /* console.log(parentFolderObject);
      console.log(childFoldersObject);
      console.log(currentFolderId);
        const currentFolderId = files.find(file => file.id === parentFolderId)
        .children.map(childFileId => files.find(file => file.id === childFileId))
        .find(childFile => childFile.name === currentFolderName); */
      return currentFolderId;
    }, parentId);
    console.log(parentId);
    if (state.project.id) {
      const postParams = {
        name: createUniqueName(fileName, parentId, getState().files),
        url: formProps.url,
        content: formProps.content || '',
        parentId,
        children: []
      };
      axios.post(`${ROOT_URL}/projects/${state.project.id}/files`, postParams, { withCredentials: true })
        .then((response) => {
          dispatch({
            type: ActionTypes.CREATE_FILE,
            ...response.data,
            parentId
          });
          dispatch(reset('new-file'));
          // dispatch({
          //   type: ActionTypes.HIDE_MODAL
          // });
          dispatch(setUnsavedChanges(true));
        })
        .catch(response => dispatch({
          type: ActionTypes.ERROR,
          error: response.data
        }));
    } else {
      const id = objectID().toHexString();
      dispatch({
        type: ActionTypes.CREATE_FILE,
        name: createUniqueName(fileName, parentId, getState().files),
        id,
        _id: id,
        url: formProps.url,
        content: formProps.content || '',
        parentId,
        children: []
      });
      dispatch(reset('new-file'));
      // dispatch({
      //   type: ActionTypes.HIDE_MODAL
      // });
      dispatch(setUnsavedChanges(true));
    }
  };
}

export function createFolder(formProps) {
  return (dispatch, getState) => {
    const state = getState();
    const selectedFile = state.files.find(file => file.isSelectedFile);
    const rootFile = state.files.find(file => file.name === 'root');
    let parentId;
    if (selectedFile.fileType === 'folder') {
      parentId = selectedFile.id;
    } else {
      parentId = rootFile.id;
    }
    if (state.project.id) {
      const postParams = {
        name: createUniqueName(formProps.name, parentId, state.files),
        content: '',
        children: [],
        parentId,
        fileType: 'folder'
      };
      axios.post(`${ROOT_URL}/projects/${state.project.id}/files`, postParams, { withCredentials: true })
        .then((response) => {
          dispatch({
            type: ActionTypes.CREATE_FILE,
            ...response.data,
            parentId
          });
          dispatch({
            type: ActionTypes.CLOSE_NEW_FOLDER_MODAL
          });
        })
        .catch(response => dispatch({
          type: ActionTypes.ERROR,
          error: response.data
        }));
    } else {
      const id = objectID().toHexString();
      dispatch({
        type: ActionTypes.CREATE_FILE,
        name: createUniqueName(formProps.name, parentId, state.files),
        id,
        _id: id,
        content: '',
        // TODO pass parent id from File Tree
        parentId,
        fileType: 'folder',
        children: []
      });
      dispatch({
        type: ActionTypes.CLOSE_NEW_FOLDER_MODAL
      });
    }
  };
}

export function updateFileName(id, name) {
  return {
    type: ActionTypes.UPDATE_FILE_NAME,
    id,
    name
  };
}

export function deleteFile(id, parentId) {
  return (dispatch, getState) => {
    const state = getState();
    if (state.project.id) {
      const deleteConfig = {
        params: {
          parentId
        }
      };
      axios.delete(`${ROOT_URL}/projects/${state.project.id}/files/${id}`, deleteConfig, { withCredentials: true })
        .then(() => {
          dispatch({
            type: ActionTypes.DELETE_FILE,
            id,
            parentId
          });
        })
        .catch((response) => {
          dispatch({
            type: ActionTypes.ERROR,
            error: response.data
          });
        });
    } else {
      dispatch({
        type: ActionTypes.DELETE_FILE,
        id,
        parentId
      });
    }
  };
}

export function showFolderChildren(id) {
  return {
    type: ActionTypes.SHOW_FOLDER_CHILDREN,
    id
  };
}

export function hideFolderChildren(id) {
  return {
    type: ActionTypes.HIDE_FOLDER_CHILDREN,
    id
  };
}

export function setBlobUrl(file, blobURL) {
  return {
    type: ActionTypes.SET_BLOB_URL,
    name: file.name,
    blobURL
  };
}

export function getBlobUrl(file) {
  if (file.blobUrl) {
    blobUtil.revokeObjectURL(file.blobUrl);
  }

  const fileBlob = blobUtil.createBlob([file.content], { type: 'text/plain' });
  const blobURL = blobUtil.createObjectURL(fileBlob);
  return blobURL;
}
