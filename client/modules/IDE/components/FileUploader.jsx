import Dropzone from 'dropzone';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { fileExtensionsAndMimeTypes } from '../../../../server/utils/fileUtils';
import { remSize } from '../../../theme';
import {
  dropzoneAcceptCallback,
  dropzoneCompleteCallback,
  dropzoneSendingCallback,
  s3BucketHttps
} from '../actions/uploader';

Dropzone.autoDiscover = false;

// TODO: theming for dark vs. light theme
// TODO: include color and background-color settings after migrating the themify variables.
const StyledUploader = styled.div`
  min-height: ${remSize(200)};
  width: 100%;
  text-align: center;
  .dz-preview.dz-image-preview {
    background-color: transparent;
  }
`;

function FileUploader() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.id);

  useEffect(() => {
    const uploader = new Dropzone('div#uploader', {
      url: s3BucketHttps,
      method: 'post',
      autoProcessQueue: true,
      clickable: true,
      hiddenInputContainer: '#hidden-input-container',
      maxFiles: 6,
      parallelUploads: 2,
      maxFilesize: 5, // in mb
      maxThumbnailFilesize: 8, // 8 mb
      thumbnailWidth: 200,
      thumbnailHeight: 200,
      acceptedFiles: fileExtensionsAndMimeTypes,
      dictDefaultMessage: t('FileUploader.DictDefaultMessage'),
      accept: (file, done) => {
        dropzoneAcceptCallback(userId, file, done);
      },
      sending: dropzoneSendingCallback
    });
    uploader.on('complete', (file) => {
      dispatch(dropzoneCompleteCallback(file));
    });
    return () => {
      uploader.destroy();
    };
  }, [userId, t, dispatch]);

  return (
    <div>
      <StyledUploader id="uploader" className="dropzone" />
      <div id="hidden-input-container" />
    </div>
  );
}

export default FileUploader;
