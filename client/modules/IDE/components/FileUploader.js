import React, { PropTypes } from 'react';
import Dropzone from 'dropzone';
const s3Bucket = `http://${process.env.S3_BUCKET}.s3.amazonaws.com/`;
import * as UploaderActions from '../actions/uploader';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class FileUploader extends React.Component {
  componentDidMount() {
    this.createDropzone();
    Dropzone.autoDiscover = false;
  }

  createDropzone() {
    this.uploader = new Dropzone('div#uploader', {
      url: s3Bucket,
      method: 'post',
      autoProcessQueue: true,
      clickable: true,
      maxFiles: 1,
      parallelUploads: 1,
      maxFilesize: 10, // in mb
      maxThumbnailFilesize: 8, // 3MB
      thumbnailWidth: 200,
      thumbnailHeight: 200,
      acceptedMimeTypes: 'image/bmp,image/gif,image/jpg,image/jpeg,image/png',
      dictDefaultMessage: 'Drop files here to upload or click to use the file browser',
      accept: this.props.dropzoneAcceptCallback,
      sending: this.props.dropzoneSendingCallback,
      complete: this.props.dropzoneCompleteCallback
    });
  }

  render() {
    return (
      <div id="uploader" className="uploader dropzone"></div>
    );
  }
}

FileUploader.propTypes = {
  dropzoneAcceptCallback: PropTypes.func.isRequired,
  dropzoneSendingCallback: PropTypes.func.isRequired,
  dropzoneCompleteCallback: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    files: state.files,
    project: state.project
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(UploaderActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FileUploader);
