import axios from 'axios';
import { createFile } from './files';
const textFileRegex = /text\//;

const s3BucketHttps = `https://s3-us-west-2.amazonaws.com/${process.env.S3_BUCKET}/`;
const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

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

export function dropzoneAcceptCallback(file, done) {
  return () => {
    // for text files and small files
    // check mime type
    // if text, local interceptor
    console.log(file.type);
    if (file.type.match(textFileRegex)) {
      localIntercept(file).then(result => {
        file.content = result; // eslint-disable-line
        done();
      })
      .catch(result => {
        done(`Failed to download file ${file.name}: ${result}`);
        console.warn(file);
      });
    } else {
      file.postData = []; // eslint-disable-line
      axios.post(`${ROOT_URL}/S3/sign`, {
        name: file.name,
        type: file.type,
        size: file.size,
        // _csrf: document.getElementById('__createPostToken').value
      },
        {
          withCredentials: true
        })
      .then(response => {
        file.custom_status = 'ready'; // eslint-disable-line
        file.postData = response.data; // eslint-disable-line
        file.s3 = response.data.key; // eslint-disable-line
        file.previewTemplate.className += ' uploading'; // eslint-disable-line
        done();
      })
      .catch(response => {
        file.custom_status = 'rejected'; // eslint-disable-line
        if (response.data.responseText && response.data.responseText.message) {
          done(response.data.responseText.message);
        }
        done('error preparing the upload');
      });
    }
  };
}

export function dropzoneSendingCallback(file, xhr, formData) {
  return () => {
    if (!file.type.match(textFileRegex)) {
      Object.keys(file.postData).forEach(key => {
        formData.append(key, file.postData[key]);
      });
      formData.append('Content-type', '');
      formData.append('Content-length', '');
      formData.append('acl', 'public-read');
    }
  };
}

export function dropzoneCompleteCallback(file) {
  return (dispatch, getState) => { // eslint-disable-line
    if (!file.type.match(textFileRegex)) {
      let inputHidden = '<input type="hidden" name="attachments[]" value="';
      const json = {
        url: `${s3BucketHttps}${file.postData.key}`,
        originalFilename: file.name
      };
      // console.log(json, JSON.stringify(json), JSON.stringify(json).replace('"', '\\"'));
      inputHidden += `${window.btoa(JSON.stringify(json))}" />`;
      // document.getElementById('uploader').appendChild(inputHidden);
      document.getElementById('uploader').innerHTML += inputHidden;

      const formParams = {
        name: file.name,
        url: `${s3BucketHttps}${file.postData.key}`
      };
      console.log(formParams);
      createFile(formParams)(dispatch, getState);
    } else {
      const formParams = {
        name: file.name,
        content: file.content
      };
      createFile(formParams)(dispatch, getState);
    }
  };
}
