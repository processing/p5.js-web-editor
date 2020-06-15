import objectID from 'bson-objectid';
import blobUtil from 'blob-util';
import { reset } from 'redux-form';
import apiClient from '../../../utils/apiClient';
import * as ActionTypes from '../../../constants';
import { setUnsavedChanges, closeNewFolderModal, closeNewFileModal } from './ide';
import { setProjectSavedTime } from './project';
import { setToastText, showToast } from './toast';

const TOAST_DISPLAY_TIME_MS = 1500;

function appendToFilename(filename, string) {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return filename + string;
  return filename.substring(0, dotIndex) + string + filename.substring(dotIndex);
}

function createUniqueName(name, parentId, files) {
  const siblingFiles = files.find(file => file.id === parentId)
    .children.map(childFileId => files.find(file => file.id === childFileId));
  let testName = name;
  let index = 1;
  let existingName = siblingFiles.find(file => name === file.name);

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

export function createFile(formProps) {
  return (dispatch, getState) => {
    const state = getState();
    const { parentId } = state.ide;
    if (state.project.id) {
      const postParams = {
        name: createUniqueName(formProps.name, parentId, state.files),
        url: formProps.url,
        content: formProps.content || '',
        parentId,
        children: []
      };
      apiClient.post(`/projects/${state.project.id}/files`, postParams)
        .then((response) => {
          dispatch({
            type: ActionTypes.CREATE_FILE,
            ...response.data.updatedFile,
            parentId
          });
          dispatch(setProjectSavedTime(response.data.project.updatedAt));
          dispatch(closeNewFileModal());
          dispatch(reset('new-file'));
          // dispatch({
          //   type: ActionTypes.HIDE_MODAL
          // });
          dispatch(setUnsavedChanges(true));
        })
        .catch((error) => {
          const { response } = error;
          dispatch({
            type: ActionTypes.ERROR,
            error: response.data
          });
          dispatch(setToastText(`Failed to create "${formProps.name}"`));
          dispatch(showToast(TOAST_DISPLAY_TIME_MS));
        });
    } else {
      const id = objectID().toHexString();
      dispatch({
        type: ActionTypes.CREATE_FILE,
        name: createUniqueName(formProps.name, parentId, state.files),
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
      dispatch(closeNewFileModal());
    }
  };
}

export function createFolder(formProps) {
  return (dispatch, getState) => {
    const state = getState();
    const { parentId } = state.ide;
    if (state.project.id) {
      const postParams = {
        name: createUniqueName(formProps.name, parentId, state.files),
        content: '',
        children: [],
        parentId,
        fileType: 'folder'
      };
      apiClient.post(`/projects/${state.project.id}/files`, postParams)
        .then((response) => {
          dispatch({
            type: ActionTypes.CREATE_FILE,
            ...response.data.updatedFile,
            parentId
          });
          dispatch(setProjectSavedTime(response.data.project.updatedAt));
          dispatch(closeNewFolderModal());
        })
        .catch((error) => {
          const { response } = error;
          dispatch({
            type: ActionTypes.ERROR,
            error: response.data
          });
        });
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
      dispatch(closeNewFolderModal());
    }
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
      apiClient.delete(`/projects/${state.project.id}/files/${id}`, deleteConfig)
        .then(() => {
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
