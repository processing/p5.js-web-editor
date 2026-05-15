import objectID from 'bson-objectid';
import blobUtil from 'blob-util';
import { opApiClient } from '../../../utils/opApiClient';
import { getFilePath } from '../../../utils/opSketchAdapter';
import * as ActionTypes from '../../../constants';
import {
  setUnsavedChanges,
  closeNewFolderModal,
  closeNewFileModal,
  setSelectedFile
} from './ide';
import { createError } from './ide';
import { showToast } from './toast';

function getTransactionErrorMessage(error, fallbackMessage) {
  const data = error?.response?.data;
  return (
    data?.message ||
    data?.error ||
    (typeof data === 'string' ? data : undefined) ||
    error?.message ||
    fallbackMessage
  );
}

function showFileTransactionError(dispatch, error, fallbackMessage) {
  const message = getTransactionErrorMessage(error, fallbackMessage);
  dispatch(showToast(message, 5000));
  dispatch(createError({ message }));
}

function getFormError(error) {
  return error?.response?.data ?? { message: error.message };
}

function getFormNameError(error) {
  const formError = getFormError(error);
  return formError?.message || formError?.error || error.message;
}

function validateAvailableName(name, parentId, files) {
  const siblingFiles = files
    .find((file) => file.id === parentId)
    .children.map((childFileId) =>
      files.find((file) => file.id === childFileId)
    )
    .filter(Boolean);
  const existingName = siblingFiles.find((file) => name === file.name);
  if (existingName) {
    throw new Error('File/Folder already exists.');
  }
  return name;
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

function getParentPath(files, parentId) {
  const parent = files.find((file) => file.id === parentId);
  if (!parent || parent.name === 'root') {
    return '';
  }
  return getFilePath(parent);
}

function getTargetFilePath(files, parentId, name) {
  const parentPath = getParentPath(files, parentId);
  return parentPath ? `${parentPath}/${name}` : name;
}

function findExistingFileByPath(files, parentId, name) {
  const targetPath = getTargetFilePath(files, parentId, name);
  return files.find((file) => getFilePath(file) === targetPath);
}

function getAllDescendantIds(files, nodeId) {
  const parentFile = files.find((file) => file.id === nodeId);
  if (!parentFile) return [];
  return parentFile.children.reduce(
    (acc, childId) => [...acc, childId, ...getAllDescendantIds(files, childId)],
    []
  );
}

function getDescendantFiles(files, nodeId) {
  return getAllDescendantIds(files, nodeId)
    .map((fileId) => files.find((file) => file.id === fileId))
    .filter(Boolean);
}

function getRenamedPath(file, oldFolderPath, newFolderPath) {
  const filePath = getFilePath(file);
  const relativePath = filePath.slice(oldFolderPath.length + 1);
  return `${newFolderPath}/${relativePath}`;
}

function encodeFilePath(filePath) {
  return filePath.split('/').map(encodeURIComponent).join('/');
}

export function submitFile(
  formProps,
  files,
  parentId,
  projectId,
  options = {}
) {
  const id = objectID().toHexString();
  let fileName;
  try {
    fileName = options.preserveName
      ? formProps.name
      : validateAvailableName(formProps.name, parentId, files);
  } catch (error) {
    return Promise.reject(error);
  }
  const file = {
    name: fileName,
    id,
    _id: id,
    url: formProps.url,
    content: formProps.content || '',
    children: []
  };
  if (projectId) {
    file.projectId = projectId;
  }
  return Promise.resolve({
    file
  });
}

export function handleCreateFile(formProps, setSelected = true, options = {}) {
  return (dispatch, getState) => {
    const state = getState();
    const { files } = state;
    const { parentId } = state.ide;
    const projectId = state.project.id;
    return new Promise((resolve) => {
      const existingFile = options.overwrite
        ? findExistingFileByPath(files, parentId, formProps.name)
        : null;

      if (existingFile?.url) {
        dispatch({
          type: ActionTypes.UPDATE_FILE_NAME,
          id: existingFile.id,
          name: existingFile.name,
          url: formProps.url
        });
        dispatch(closeNewFileModal());
        dispatch(setUnsavedChanges(true));
        resolve({ file: existingFile, overwritten: true });
        return;
      }

      submitFile(formProps, files, parentId, projectId, options)
        .then((response) => {
          const { file } = response;
          dispatch(createFile(file, parentId));
          dispatch(closeNewFileModal());
          dispatch(setUnsavedChanges(true));
          if (setSelected) {
            dispatch(setSelectedFile(file.id));
          }
          resolve();
        })
        .catch((error) => {
          showFileTransactionError(
            dispatch,
            error,
            'File/Folder already exists.'
          );
          resolve({ name: getFormNameError(error), error });
        });
    });
  };
}

export function submitFolder(formProps, files, parentId, projectId) {
  const id = objectID().toHexString();
  let folderName;
  try {
    folderName = validateAvailableName(formProps.name, parentId, files);
  } catch (error) {
    return Promise.reject(error);
  }
  const file = {
    type: ActionTypes.CREATE_FILE,
    name: folderName,
    id,
    _id: id,
    content: '',
    // TODO pass parent id from File Tree
    fileType: 'folder',
    children: []
  };
  if (projectId) {
    file.projectId = projectId;
  }
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
          const { file } = response;
          dispatch(createFile(file, parentId));
          dispatch(closeNewFolderModal());
          dispatch(setUnsavedChanges(true));
          resolve();
        })
        .catch((error) => {
          showFileTransactionError(
            dispatch,
            error,
            'File/Folder already exists.'
          );
          resolve({ name: getFormNameError(error), error });
        });
    });
  };
}

export function updateFileName(id, name) {
  return async (dispatch, getState) => {
    const state = getState();
    const file = state.files.find((candidate) => candidate.id === id);
    let updatedName = name;
    let updatedUrl;
    let urlsById = {};

    if (state.project.id && file?.url) {
      try {
        const response = await opApiClient.patch(
          `/sketch/${state.project.id}/files/${encodeFilePath(
            getFilePath(file)
          )}`,
          { name }
        );
        updatedName = response.data.name || name;
        updatedUrl = response.data.url;
      } catch (error) {
        showFileTransactionError(dispatch, error, 'Failed to rename file.');
        return { error };
      }
    } else if (state.project.id && file?.fileType === 'folder') {
      const oldFolderPath = getFilePath(file);
      const newFolderPath = file.filePath ? `${file.filePath}/${name}` : name;
      const assetFiles = getDescendantFiles(state.files, id).filter(
        (descendant) => descendant.url
      );

      try {
        const responses = await Promise.all(
          assetFiles.map((assetFile) =>
            opApiClient
              .patch(
                `/sketch/${state.project.id}/files/${encodeFilePath(
                  getFilePath(assetFile)
                )}`,
                {
                  name: getRenamedPath(assetFile, oldFolderPath, newFolderPath)
                }
              )
              .then((response) => ({
                id: assetFile.id,
                url: response.data.url
              }))
          )
        );
        urlsById = responses.reduce(
          (acc, response) => ({
            ...acc,
            [response.id]: response.url
          }),
          {}
        );
      } catch (error) {
        showFileTransactionError(dispatch, error, 'Failed to rename folder.');
        return { error };
      }
      dispatch(setUnsavedChanges(true));
    } else {
      dispatch(setUnsavedChanges(true));
    }

    dispatch({
      type: ActionTypes.UPDATE_FILE_NAME,
      id,
      name: updatedName,
      url: updatedUrl,
      urlsById
    });
    return { name: updatedName, url: updatedUrl, urlsById };
  };
}

export function deleteFile(id, parentId) {
  return async (dispatch, getState) => {
    const state = getState();
    const file = state.files.find((candidate) => candidate.id === id);
    const descendants = [file, ...getDescendantFiles(state.files, id)].filter(
      Boolean
    );
    const assetFilesToDelete = descendants.filter(
      (candidate) => candidate?.url
    );
    const codeTitlesToDelete = descendants
      .filter(
        (candidate) =>
          candidate?.fileType === 'file' &&
          !candidate.url &&
          state.project.savedCodeTitles?.includes(getFilePath(candidate))
      )
      .map(getFilePath);

    if (
      state.project.id &&
      (assetFilesToDelete.length > 0 || codeTitlesToDelete.length > 0)
    ) {
      const requests = [
        ...assetFilesToDelete.map((fileToDelete) =>
          opApiClient.delete(
            `/sketch/${state.project.id}/files/${encodeFilePath(
              getFilePath(fileToDelete)
            )}`
          )
        ),
        ...codeTitlesToDelete.map((title) =>
          opApiClient.delete(
            `/sketch/${state.project.id}/code/${encodeURIComponent(title)}`
          )
        )
      ];

      try {
        await Promise.all(requests);
      } catch (error) {
        showFileTransactionError(dispatch, error, 'Failed to delete file.');
        return;
      }
    }

    if (codeTitlesToDelete.length > 0) {
      dispatch({
        type: ActionTypes.SET_SAVED_CODE_TITLES,
        titles: state.project.savedCodeTitles.filter(
          (title) => !codeTitlesToDelete.includes(title)
        )
      });
    }

    dispatch({
      type: ActionTypes.DELETE_FILE,
      id,
      parentId
    });

    if (!file?.url) {
      dispatch(setUnsavedChanges(true));
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
