import React, { PropTypes } from 'react';
import Dropzone from 'dropzone';
const s3Bucket = 'http://p5js-web-editor-test.s3.amazonaws.com/';
import * as UploaderActions from '../actions/uploader';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

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
