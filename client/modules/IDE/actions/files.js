import * as ActionTypes from '../../../constants';
import axios from 'axios';
import blobUtil from 'blob-util';
import xhr from 'xhr';
import fileType from 'file-type';
import objectID from 'bson-objectid';

const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

function appendToFilename(filename, string) {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return filename + string;
  return filename.substring(0, dotIndex) + string + filename.substring(dotIndex);
}

function createUniqueName(name, files) {
  let testName = name;
  let index = 1;
  let existingName = files.find((file) => name === file.name);

  while (existingName) {
    testName = appendToFilename(name, `-${index}`);
    index++;
    existingName = files.find((file) => testName === file.name); // eslint-disable-line
  }
  return testName;
}

export function updateFileContent(name, content) {
  return {
    type: ActionTypes.UPDATE_FILE_CONTENT,
    name,
    content
  };
}

export function getBlobUrl(file) {
  return (dispatch) => {
    xhr({
      uri: file.url,
      responseType: 'arraybuffer',
      useXDR: true
    }, (err, body, res) => {
      if (err) throw err;
      const typeOfFile = fileType(new Uint8Array(res));
      blobUtil.arrayBufferToBlob(res, typeOfFile.mime)
      .then(blobUtil.createObjectURL)
      .then(objectURL => {
        dispatch({
          type: ActionTypes.SET_BLOB_URL,
          name: file.name,
          blobURL: objectURL
        });
      });
    });

    // blobUtil.imgSrcToBlob(file.url, undefined, { crossOrigin: 'Anonymous' })
    // .then(blobUtil.createObjectURL)
    // .then(objectURL => {
    //   dispatch({
    //     type: ActionTypes.SET_BLOB_URL,
    //     name: file.name,
    //     blobURL: objectURL
    //   });
    // });
  };
}

export function createFile(formProps) {
  return (dispatch, getState) => {
    const state = getState();
    const rootFile = state.files.filter(file => file.name === 'root')[0];
    if (state.project.id) {
      const postParams = {
        name: createUniqueName(formProps.name, state.files),
        url: formProps.url,
        content: formProps.content || '',
        // TODO pass parent id to API, once there are folders
        parentId: rootFile.id
      };
      axios.post(`${ROOT_URL}/projects/${state.project.id}/files`, postParams, { withCredentials: true })
        .then(response => {
          if (response.data.url) {
            getBlobUrl(response.data)(dispatch);
          }
          dispatch({
            type: ActionTypes.CREATE_FILE,
            ...response.data,
            parentId: rootFile.id
          });
          dispatch({
            type: ActionTypes.HIDE_MODAL
          });
        })
        .catch(response => dispatch({
          type: ActionTypes.ERROR,
          error: response.data
        }));
    } else {
      if (formProps.url) {
        getBlobUrl(formProps)(dispatch);
      }
      const id = objectID().toHexString();
      dispatch({
        type: ActionTypes.CREATE_FILE,
        name: createUniqueName(formProps.name, state.files),
        id,
        _id: id,
        url: formProps.url,
        content: formProps.content || '',
        // TODO pass parent id from File Tree
        parentId: rootFile.id
      });
      dispatch({
        type: ActionTypes.HIDE_MODAL
      });
    }
  };
}

export function showFileOptions(fileId) {
  return {
    type: ActionTypes.SHOW_FILE_OPTIONS,
    id: fileId
  };
}

export function hideFileOptions(fileId) {
  return {
    type: ActionTypes.HIDE_FILE_OPTIONS,
    id: fileId
  };
}

export function showEditFileName(id) {
  return {
    type: ActionTypes.SHOW_EDIT_FILE_NAME,
    id
  };
}

export function hideEditFileName(id) {
  return {
    type: ActionTypes.HIDE_EDIT_FILE_NAME,
    id
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
        .catch(response => {
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
