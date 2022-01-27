import PropTypes from 'prop-types';
import React from 'react';
import Dropzone from 'dropzone';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import * as UploaderActions from '../actions/uploader';
import getConfig from '../../../utils/getConfig';
import { fileExtensionsAndMimeTypes } from '../../../../server/utils/fileUtils';

const s3Bucket =
  getConfig('S3_BUCKET_URL_BASE') ||
  `https://s3-${getConfig('AWS_REGION')}.amazonaws.com/${getConfig(
    'S3_BUCKET'
  )}/`;

class FileUploader extends React.Component {
  componentDidMount() {
    this.createDropzone();
    Dropzone.autoDiscover = false;
  }

  createDropzone() {
    const userId = this.props.project.owner
      ? this.props.project.owner.id
      : this.props.user.id;
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
      acceptedFiles: fileExtensionsAndMimeTypes,
      dictDefaultMessage: this.props.t('FileUploader.DictDefaultMessage'),
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
    return <div id="uploader" className="uploader dropzone"></div>;
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
  }),
  t: PropTypes.func.isRequired
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

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(FileUploader)
);
