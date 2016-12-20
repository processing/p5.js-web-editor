import React, { PropTypes } from 'react';
import Dropzone from 'dropzone';
const s3Bucket = `https://s3-us-west-2.amazonaws.com/${process.env.S3_BUCKET}/`;
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
      maxFiles: 6,
      parallelUploads: 2,
      maxFilesize: 5, // in mb
      maxThumbnailFilesize: 8, // 8 mb
      thumbnailWidth: 200,
      thumbnailHeight: 200,
      // TODO what is a good list of MIME types????
      acceptedFiles: `image/*,audio/*,text/javascript,text/html,text/css,
      application/json,application/x-font-ttf,application/x-font-truetype,
      text/plain,text/csv,.obj,video/webm,video/ogg,video/quicktime,video/mp4,
      .otf,.ttf`,
      dictDefaultMessage: 'Drop files here to upload or click to use the file browser',
      accept: this.props.dropzoneAcceptCallback,
      sending: this.props.dropzoneSendingCallback,
      complete: this.props.dropzoneCompleteCallback,
      // error: (file, errorMessage) => {
      //   console.log(file);
      //   console.log(errorMessage);
      // }
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
