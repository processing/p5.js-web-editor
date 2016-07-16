import axios from 'axios';

const s3Bucket = 'http://p5js-web-editor-test.s3.amazonaws.com/';
const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:8000/api' : '/api';

export function dropzoneAcceptCallback(file, done) {
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

export function dropzoneSendingCallback(file, xhr, formData) {
  Object.keys(file.postData).forEach(key => {
    formData.append(key, file.postData[key]);
  });
  formData.append('Content-type', '');
  formData.append('Content-length', '');
  formData.append('acl', 'public-read');
}

export function dropzoneCompleteCallback(file) {
  let inputHidden = '<input type="hidden" name="attachments[]" value="';
  const json = {
    url: `${s3Bucket}${file.postData.key}`,
    originalFilename: file.name
  };
  console.log(json, JSON.stringify(json), JSON.stringify(json).replace('"', '\\"'));
  inputHidden += `${window.btoa(JSON.stringify(json))}" />`;
  // document.getElementById('uploader').appendChild(inputHidden);
  document.getElementById('uploader').innerHTML += inputHidden;
}
