import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import api from '../../../utils/api';
import Button from '../../../common/Button';
import Modal from './Modal';

const UploadMediaModal = ({ onUploadSuccess, onClose }) => {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setImageUrl(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    if (!imageUrl.trim()) {
      setError(t('UploadMediaModal.EmptyUrlError', 'Image URL is required'));
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log('Uploading image URL:', imageUrl);
      const { s3Url } = await api.uploadImageByUrl(imageUrl);
      console.log('Upload success, s3Url:', s3Url);
      onUploadSuccess(s3Url);
    } catch (err) {
      console.error('Upload failed:', err.message, err.stack);
      setError(t('UploadMediaModal.UploadError', 'Failed to upload image'));
      setIsUploading(false);
    }
  };

  return (
    <Modal
      title={t('UploadMediaModal.Title', 'Upload Image by URL')}
      onClose={onClose}
      closeAriaLabel={t(
        'UploadMediaModal.CloseAriaLabel',
        'Close upload media modal'
      )}
      contentClassName="upload-media-modal__content"
    >
      <div className="upload-media-modal__input-wrapper">
        <label className="upload-media-modal__name-label" htmlFor="image-url">
          {t('UploadMediaModal.UrlLabel', 'Image URL')}
        </label>
        <input
          id="image-url"
          type="text"
          value={imageUrl}
          onChange={handleInputChange}
          placeholder={t('UploadMediaModal.UrlPlaceholder', 'Enter image URL')}
          className="upload-media-modal__input"
          disabled={isUploading}
        />
      </div>

      {error && <p className="upload-media-modal__error">{error}</p>}

      <div className="modal__divider" />

      <div className="upload-media-modal__footer">
        <Button
          className="upload-media-modal__button"
          onClick={handleSubmit}
          disabled={isUploading}
        >
          {isUploading
            ? t('UploadMediaModal.Uploading', 'Uploading...')
            : t('UploadMediaModal.Upload', 'Upload')}
        </Button>
        <Button
          className="upload-media-modal__button upload-media-modal__button--cancel"
          onClick={onClose}
          disabled={isUploading}
        >
          {t('UploadMediaModal.Cancel', 'Cancel')}
        </Button>
      </div>
    </Modal>
  );
};

UploadMediaModal.propTypes = {
  onUploadSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default UploadMediaModal;
