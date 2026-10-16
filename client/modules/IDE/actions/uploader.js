import { TEXT_FILE_REGEX } from '../../../../server/utils/fileUtils';
import { apiClient } from '../../../utils/apiClient';
import { getConfig } from '../../../utils/getConfig';
import { isTestEnvironment } from '../../../utils/checkTestEnv';
import { handleCreateFile } from './files';
import { showErrorModal } from './ide';

const s3BucketUrlBase = getConfig('S3_BUCKET_URL_BASE');
const awsRegion = getConfig('AWS_REGION');
const s3Bucket = getConfig('S3_BUCKET');

if (!isTestEnvironment && !s3BucketUrlBase && !(awsRegion && s3Bucket)) {
  throw new Error(`S3 bucket address not configured. 
    Configure either S3_BUCKET_URL_BASE or both AWS_REGION & S3_BUCKET in env vars`);
}

export const s3BucketHttps =
  s3BucketUrlBase || `https://s3-${awsRegion}.amazonaws.com/${s3Bucket}/`;

const MAX_LOCAL_FILE_SIZE = 80000; // bytes, aka 80 KB

function isS3Upload(file) {
  return !TEXT_FILE_REGEX.test(file.name) || file.size >= MAX_LOCAL_FILE_SIZE;
}

export async function dropzoneAcceptCallback(userId, file, done, dispatch) {
  // if a user would want to edit this file as text, local interceptor
  if (!isS3Upload(file)) {
    try {
      // eslint-disable-next-line no-param-reassign
      file.content = await file.text();
      // Make it an error so that it won't be sent to S3, but style as a success.
      done('Large text file detected: Loading locally for editing.');
      file.previewElement.classList.remove('dz-error');
      file.previewElement.classList.add('dz-success');
      file.previewElement.classList.add('dz-processing');
      file.previewElement.querySelector('.dz-upload').style.width = '100%';
    } catch (error) {
      done(`Failed to download file ${file.name}: ${error}`);
      console.warn(file);
    }
  } else {
    try {
      const response = await apiClient.post('/S3/sign', {
        name: file.name,
        type: file.type,
        size: file.size,
        userId
        // _csrf: document.getElementById('__createPostToken').value
      });
      // eslint-disable-next-line no-param-reassign
      file.postData = response.data;
      done();
    } catch (error) {
      if (error?.response?.status === 403) {
        if (dispatch) {
          dispatch(showErrorModal('uploadLimit'));
        }
        done('Upload limit reached.');
        return;
      }
      done(
        error?.response?.data?.responseText?.message ||
          error?.message ||
          'Error: Reached upload limit.'
      );
    }
  }
}

export function dropzoneSendingCallback(file, xhr, formData) {
  if (isS3Upload(file)) {
    Object.keys(file.postData).forEach((key) => {
      formData.append(key, file.postData[key]);
    });
  }
}

export function dropzoneCompleteCallback(file) {
  return (dispatch) => {
    if (isS3Upload(file) && file.postData && file.status !== 'error') {
      const formParams = {
        name: file.name,
        url: `${s3BucketHttps}${file.postData.key}`
      };
      dispatch(handleCreateFile(formParams, false));
    } else if (file.content !== undefined) {
      const formParams = {
        name: file.name,
        content: file.content
      };
      dispatch(handleCreateFile(formParams, false));
    } else if (file.status === 'error' || file.xhr.status >= 400) {
      let uploadFileErrorMessage = 'Uploading file to AWS failed.';
      if (file.xhr?.response) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(file.xhr.response, 'text/xml');
        const message = xmlDoc.getElementsByTagName('Message')[0]?.textContent;
        const code = xmlDoc.getElementsByTagName('Code')[0]?.textContent;
        uploadFileErrorMessage = `${code}: ${message}`;
      }
      file.previewElement.classList.add('dz-error');
      file.previewElement.classList.remove('dz-success');
      const dzErrorMessageElement = file.previewElement?.querySelector(
        '[data-dz-errormessage]'
      );
      if (dzErrorMessageElement) {
        dzErrorMessageElement.textContent = uploadFileErrorMessage;
      }
    }
  };
}
