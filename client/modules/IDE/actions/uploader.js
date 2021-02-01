import apiClient from '../../../utils/apiClient';
import getConfig from '../../../utils/getConfig';
import { createFile } from './files';
import { TEXT_FILE_REGEX } from '../../../../server/utils/fileUtils';

const s3BucketHttps =
  getConfig('S3_BUCKET_URL_BASE') ||
  `https://s3-${getConfig('AWS_REGION')}.amazonaws.com/${getConfig(
    'S3_BUCKET'
  )}/`;
const MAX_LOCAL_FILE_SIZE = 80000; // bytes, aka 80 KB

function localIntercept(file, options = {}) {
  return new Promise((resolve, reject) => {
    if (!options.readType) {
      // const mime = file.type;
      // const textType = a(_textTypes).any(type => {
      //   const re = new RegExp(type);
      //   return re.test(mime);
      // });
      // options.readType = textType ? 'readAsText' : 'readAsDataURL';
      options.readType = 'readAsText'; // eslint-disable-line
    }
    const reader = new window.FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = () => {
      reject(reader.result);
    };

    // run the reader
    reader[options.readType](file);
  });
}

function toBinary(string) {
  const codeUnits = new Uint16Array(string.length);
  for (let i = 0; i < codeUnits.length; i += 1) {
    codeUnits[i] = string.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
}

export function dropzoneAcceptCallback(userId, file, done) {
  return () => {
    // if a user would want to edit this file as text, local interceptor
    if (file.name.match(TEXT_FILE_REGEX) && file.size < MAX_LOCAL_FILE_SIZE) {
      localIntercept(file)
        .then((result) => {
        file.content = result; // eslint-disable-line
          done('Uploading plaintext file locally.');
          file.previewElement.classList.remove('dz-error');
          file.previewElement.classList.add('dz-success');
          file.previewElement.classList.add('dz-processing');
          file.previewElement.querySelector('.dz-upload').style.width = '100%';
        })
        .catch((result) => {
          done(`Failed to download file ${file.name}: ${result}`);
          console.warn(file);
        });
    } else {
      file.postData = []; // eslint-disable-line
      apiClient
        .post('/S3/sign', {
          name: file.name,
          type: file.type,
          size: file.size,
          userId
          // _csrf: document.getElementById('__createPostToken').value
        })
        .then((response) => {
          file.custom_status = 'ready'; // eslint-disable-line
          file.postData = response.data; // eslint-disable-line
          file.s3 = response.data.key; // eslint-disable-line
          file.previewTemplate.className += ' uploading'; // eslint-disable-line
          done();
        })
        .catch((error) => {
          const { response } = error;
          file.custom_status = 'rejected'; // eslint-disable-line
          if (
            response.data &&
            response.data.responseText &&
            response.data.responseText.message
          ) {
            done(response.data.responseText.message);
          }
          done('Error: Reached upload limit.');
        });
    }
  };
}

export function dropzoneSendingCallback(file, xhr, formData) {
  return () => {
    if (!file.name.match(TEXT_FILE_REGEX) || file.size >= MAX_LOCAL_FILE_SIZE) {
      Object.keys(file.postData).forEach((key) => {
        formData.append(key, file.postData[key]);
      });
    }
  };
}

export function dropzoneCompleteCallback(file) {
  return (dispatch, getState) => { // eslint-disable-line
    if (
      (!file.name.match(TEXT_FILE_REGEX) || file.size >= MAX_LOCAL_FILE_SIZE) &&
      file.status !== 'error'
    ) {
      let inputHidden = '<input type="hidden" name="attachments[]" value="';
      const json = {
        url: `${s3BucketHttps}${file.postData.key}`,
        originalFilename: file.name
      };

      let jsonStr = JSON.stringify(json);

      // convert the json string to binary data so that btoa can encode it
      jsonStr = toBinary(jsonStr);
      inputHidden += `${window.btoa(jsonStr)}" />`;
      document.getElementById('uploader').innerHTML += inputHidden;

      const formParams = {
        name: file.name,
        url: `${s3BucketHttps}${file.postData.key}`
      };
      createFile(formParams)(dispatch, getState);
    } else if (file.content !== undefined) {
      const formParams = {
        name: file.name,
        content: file.content
      };
      createFile(formParams)(dispatch, getState);
    }
  };
}
