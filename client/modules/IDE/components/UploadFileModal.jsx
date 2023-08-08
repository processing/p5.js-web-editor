import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import prettyBytes from 'pretty-bytes';
import getConfig from '../../../utils/getConfig';
import { closeUploadFileModal } from '../actions/ide';
import FileUploader from './FileUploader';
import { getreachedTotalSizeLimit } from '../selectors/users';
import Modal from './Modal';

const limit = getConfig('UPLOAD_LIMIT') || 250000000;
const limitText = prettyBytes(limit);

const UploadFileModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const reachedTotalSizeLimit = useSelector(getreachedTotalSizeLimit);
  const onClose = () => dispatch(closeUploadFileModal());
  return (
    <Modal
      title={t('UploadFileModal.Title')}
      closeAriaLabel={t('UploadFileModal.CloseButtonARIA')}
      onClose={onClose}
    >
      {reachedTotalSizeLimit ? (
        <p>
          {t('UploadFileModal.SizeLimitError', {
            sizeLimit: limitText
          })}
          <Link to="/assets" onClick={onClose}>
            assets
          </Link>
          .
        </p>
      ) : (
        <FileUploader />
      )}
    </Modal>
  );
};

export default UploadFileModal;
