import objectID from 'bson-objectid';
import blobUtil from 'blob-util';
import apiClient from '../../../utils/apiClient';
import * as ActionTypes from '../../../constants';
import {
  setUnsavedChanges,
  closeNewFolderModal,
  closeNewFileModal,
  setSelectedFile
} from './ide';
import { setProjectSavedTime } from './project';
import { createError } from './ide';

export function appendToFilename(filename, string) {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return filename + string;
  return (
    filename.substring(0, dotIndex) + string + filename.substring(dotIndex)
  );
}

export function createUniqueName(name, parentId, files) {
  const siblingFiles = files
    .find((file) => file.id === parentId)
    .children.map((childFileId) =>
      files.find((file) => file.id === childFileId)
    );
  let testName = name;
  let index = 1;
  let existingName = siblingFiles.find((file) => name === file.name);

  while (existingName) {
    testName = appendToFilename(name, `-${index}`);
    index += 1;
    existingName = siblingFiles.find((file) => testName === file.name); // eslint-disable-line
  }
  return testName;
}

export function updateFileContent(id, content) {
  return {
    type: ActionTypes.UPDATE_FILE_CONTENT,
    id,
    content
  };
}

export function createFile(file, parentId) {
  return {
    type: ActionTypes.CREATE_FILE,
    ...file,
    parentId
  };
}

export function submitFile(formProps, files, parentId, projectId) {
  if (projectId) {
    const postParams = {
      name: createUniqueName(formProps.name, parentId, files),
      url: formProps.url,
      content: formProps.content || '',
      parentId,
      children: []
    };
    return apiClient
      .post(`/projects/${projectId}/files`, postParams)
      .then((response) => ({
        file: response.data.updatedFile,
        updatedAt: response.data.project.updatedAt
      }));
  }
  const id = objectID().toHexString();
  const file = {
    name: createUniqueName(formProps.name, parentId, files),
    id,
    _id: id,
    url: formProps.url,
    content: formProps.content || '',
    children: []
  };
  return Promise.resolve({
    file
  });
}

export function handleCreateFile(formProps, setSelected = true) {
  return (dispatch, getState) => {
    const state = getState();
    const { files } = state;
    const { parentId } = state.ide;
    const projectId = state.project.id;
    return new Promise((resolve) => {
      submitFile(formProps, files, parentId, projectId)
        .then((response) => {
          const { file, updatedAt } = response;
          dispatch(createFile(file, parentId));
          if (updatedAt) dispatch(setProjectSavedTime(updatedAt));
          dispatch(closeNewFileModal());
          dispatch(setUnsavedChanges(true));
          if (setSelected) {
            dispatch(setSelectedFile(file.id));
          }
          resolve();
        })
        .catch((error) => {
          const { response } = error;
          dispatch(createError(response.data));
          resolve({ error });
        });
    });
  };
}

export function submitFolder(formProps, files, parentId, projectId) {
  if (projectId) {
    const postParams = {
      name: createUniqueName(formProps.name, parentId, files),
      content: '',
      children: [],
      parentId,
      fileType: 'folder'
    };
    return apiClient
      .post(`/projects/${projectId}/files`, postParams)
      .then((response) => ({
        file: response.data.updatedFile,
        updatedAt: response.data.project.updatedAt
      }));
  }
  const id = objectID().toHexString();
  const file = {
    type: ActionTypes.CREATE_FILE,
    name: createUniqueName(formProps.name, parentId, files),
    id,
    _id: id,
    content: '',
    // TODO pass parent id from File Tree
    fileType: 'folder',
    children: []
  };
  return Promise.resolve({
    file
  });
}

export function handleCreateFolder(formProps) {
  return (dispatch, getState) => {
    const state = getState();
    const { files } = state;
    const { parentId } = state.ide;
    const projectId = state.project.id;
    return new Promise((resolve) => {
      submitFolder(formProps, files, parentId, projectId)
        .then((response) => {
          const { file, updatedAt } = response;
          dispatch(createFile(file, parentId));
          if (updatedAt) dispatch(setProjectSavedTime(updatedAt));
          dispatch(closeNewFolderModal());
          dispatch(setUnsavedChanges(true));
          resolve();
        })
        .catch((error) => {
          const { response } = error;
          dispatch(createError(response.data));
          resolve({ error });
        });
    });
  };
}

export function updateFileName(id, name) {
  return (dispatch) => {
    dispatch(setUnsavedChanges(true));
    dispatch({
      type: ActionTypes.UPDATE_FILE_NAME,
      id,
      name
    });
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
      apiClient
        .delete(`/projects/${state.project.id}/files/${id}`, deleteConfig)
        .then((response) => {
          dispatch(setProjectSavedTime(response.data.project.updatedAt));
          dispatch({
            type: ActionTypes.DELETE_FILE,
            id,
            parentId
          });
        })
        .catch((error) => {
          const { response } = error;
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
    id: file.id,
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
