import React, { PropTypes } from 'react';
import Dropzone from 'dropzone';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as UploaderActions from '../actions/uploader';

const s3Bucket = process.env.S3_BUCKET_URL_BASE ||
                 `https://s3-${process.env.AWS_REGION}.amazonaws.com/${process.env.S3_BUCKET}/`;

class FileUploader extends React.Component {
  componentDidMount() {
    this.createDropzone();
    Dropzone.autoDiscover = false;
  }

  createDropzone() {
    const userId = this.props.project.owner ? this.props.project.owner.id : this.props.user.id;
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
      accept: this.props.dropzoneAcceptCallback.bind(this, userId),
      sending: this.props.dropzoneSendingCallback,
      complete: this.props.dropzoneCompleteCallback
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
  dropzoneCompleteCallback: PropTypes.func.isRequired,
  project: PropTypes.shape({
    owner: PropTypes.shape({
      id: PropTypes.string
    })
  }),
  user: PropTypes.shape({
    id: PropTypes.string
  })
};

FileUploader.defaultProps = {
  project: {
    id: undefined,
    owner: undefined
  },
  user: {
    id: undefined
  }
};

function mapStateToProps(state) {
  return {
    files: state.files,
    project: state.project,
    user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(UploaderActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FileUploader);
