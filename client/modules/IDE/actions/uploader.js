import { TEXT_FILE_REGEX } from '../../../../server/utils/fileUtils';
import { opApiClient } from '../../../utils/opApiClient';
import { getFilePath } from '../../../utils/opSketchAdapter';
import { handleCreateFile } from './files';
import { showErrorModal } from './ide';
import { showToast } from './toast';

const MAX_LOCAL_FILE_SIZE = 80000; // bytes, aka 80 KB
const FILENAME_TEMPLATE = ['$', '{filename}'].join('');
const uploadPoliciesBySketchId = {};

function isS3Upload(file) {
  return !TEXT_FILE_REGEX.test(file.name) || file.size >= MAX_LOCAL_FILE_SIZE;
}

function getTransactionErrorMessage(error, fallbackMessage) {
  const data = error?.response?.data;
  return (
    data?.message ||
    data?.error ||
    data?.responseText?.message ||
    (typeof data === 'string' ? data : undefined) ||
    error?.message ||
    fallbackMessage
  );
}

function showUploadError(dispatch, file, message) {
  dispatch(showToast(message, 5000));
  if (!file.previewElement) {
    return;
  }
  file.previewElement.classList.add('dz-error');
  file.previewElement.classList.remove('dz-success');
  const dzErrorMessageElement = file.previewElement.querySelector(
    '[data-dz-errormessage]'
  );
  if (dzErrorMessageElement) {
    dzErrorMessageElement.textContent = message;
  }
}

function buildUploadedFileUrl(fileBase, uploadPath, filename) {
  const base = fileBase.endsWith('/') ? fileBase : `${fileBase}/`;
  const path = uploadPath ? `${uploadPath}/${filename}` : filename;
  return encodeURI(`${base}${path}`);
}

function buildS3Key(keyTemplate, uploadPath) {
  if (!uploadPath) {
    return keyTemplate;
  }
  return keyTemplate.replace(
    FILENAME_TEMPLATE,
    `${uploadPath}/${FILENAME_TEMPLATE}`
  );
}

function getUploadPath(files, parentId) {
  const parent = files.find((file) => file.id === parentId);
  if (!parent || parent.name === 'root') {
    return '';
  }
  return getFilePath(parent);
}

async function getUploadPolicy(projectId) {
  if (!uploadPoliciesBySketchId[projectId]) {
    uploadPoliciesBySketchId[projectId] = opApiClient
      .get(`/sketch/${projectId}/fileUploadPolicy`)
      .then((response) => response.data)
      .catch((error) => {
        delete uploadPoliciesBySketchId[projectId];
        throw error;
      });
  }
  return uploadPoliciesBySketchId[projectId];
}

export function getDropzoneUploadUrl(files) {
  return files[0]?.postData?.bucket ?? '';
}

export async function dropzoneAcceptCallback(
  projectId,
  uploadPath,
  file,
  done,
  dispatch
) {
  // if a user would want to edit this file as text, local interceptor
  if (!isS3Upload(file)) {
    try {
      // eslint-disable-next-line no-param-reassign
      file.content = await file.text();
      // Make it an error so that it won't be sent to S3, but style as a success.
      done('Uploading plaintext file locally.');
      file.previewElement.classList.remove('dz-error');
      file.previewElement.classList.add('dz-success');
      file.previewElement.classList.add('dz-processing');
      file.previewElement.querySelector('.dz-upload').style.width = '100%';
    } catch (error) {
      done(`Failed to download file ${file.name}: ${error}`);
      console.warn(file);
    }
  } else {
    if (!projectId) {
      done('Please save this sketch before uploading asset files.');
      return;
    }
    try {
      file.postData = await getUploadPolicy(projectId);
      file.uploadPath = uploadPath;
      done();
    } catch (error) {
      if (error?.response?.status === 403 || error?.response?.status === 413) {
        if (dispatch) {
          dispatch(showErrorModal('uploadLimit'));
          dispatch(showToast('Upload limit reached.', 5000));
        }
        done('Upload limit reached.');
        return;
      }
      const message = getTransactionErrorMessage(
        error,
        'Failed to prepare file upload.'
      );
      if (dispatch) {
        dispatch(showToast(message, 5000));
      }
      done(message);
    }
  }
}

export function dropzoneSendingCallback(file, xhr, formData) {
  if (isS3Upload(file)) {
    Object.keys(file.postData).forEach((key) => {
      if (key !== 'bucket' && file.postData[key] !== undefined) {
        formData.append(
          key,
          key === 'key'
            ? buildS3Key(file.postData[key], file.uploadPath)
            : file.postData[key]
        );
      }
    });
    formData.append('Content-Type', file.type || '');
  }
}

export function dropzoneCompleteCallback(file) {
  return async (dispatch, getState) => {
    if (isS3Upload(file) && file.postData && file.status !== 'error') {
      const { fileBase } = getState().project;
      if (!fileBase) {
        showUploadError(
          dispatch,
          file,
          'Missing OP fileBase; uploaded file URL was not added.'
        );
        return;
      }
      const formParams = {
        name: file.name,
        url: buildUploadedFileUrl(fileBase, file.uploadPath, file.name)
      };
      const result = await dispatch(
        handleCreateFile(formParams, false, {
          overwrite: true,
          preserveName: true
        })
      );
      if (result?.error) {
        showUploadError(
          dispatch,
          file,
          getTransactionErrorMessage(
            result.error,
            'Failed to add uploaded file.'
          )
        );
      }
    } else if (file.content !== undefined) {
      const formParams = {
        name: file.name,
        content: file.content
      };
      const result = await dispatch(handleCreateFile(formParams, false));
      if (result?.error) {
        showUploadError(
          dispatch,
          file,
          getTransactionErrorMessage(
            result.error,
            'Failed to add uploaded file.'
          )
        );
      }
    } else if (file.status === 'error' || file.xhr?.status >= 400) {
      let uploadFileErrorMessage = 'Uploading file to AWS failed.';
      if (file.xhr?.response) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(file.xhr.response, 'text/xml');
        const message = xmlDoc.getElementsByTagName('Message')[0]?.textContent;
        const code = xmlDoc.getElementsByTagName('Code')[0]?.textContent;
        uploadFileErrorMessage = `${code}: ${message}`;
      }
      showUploadError(dispatch, file, uploadFileErrorMessage);
    }
  };
}

export function getUploadPathForParent(files, parentId) {
  return getUploadPath(files, parentId);
}
