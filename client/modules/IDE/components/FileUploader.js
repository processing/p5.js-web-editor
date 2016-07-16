import React from 'react';
import Dropzone from 'dropzone';
const s3Bucket = 'http://p5js-web-editor-test.s3.amazonaws.com/';
import { dropzoneAcceptCallback,
        dropzoneSendingCallback,
        dropzoneCompleteCallback } from '../actions/uploader';

class FileUploader extends React.Component {
  componentDidMount() {
    Dropzone.autoDiscover = false;
    this.uploader = new Dropzone('div#uploader', {
      url: s3Bucket,
      method: 'post',
      autoProcessQueue: true,
      clickable: true,
      maxFiles: 1,
      parallelUploads: 1,
      maxFilesize: 10, // in mb
      maxThumbnailFilesize: 8, // 3MB
      thumbnailWidth: 150,
      thumbnailHeight: 150,
      acceptedMimeTypes: 'image/bmp,image/gif,image/jpg,image/jpeg,image/png',
      accept: dropzoneAcceptCallback,
      sending: dropzoneSendingCallback,
      complete: dropzoneCompleteCallback
    });
  }

  render() {
    return (
      <div id="uploader" className="uploader dropzone"></div>
    );
  }
}

export default FileUploader;
