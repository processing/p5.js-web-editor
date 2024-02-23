import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyableInput from './CopyableInput';

const ShareModal = ({ projectId, ownerUsername, projectName }) => {
  const { t } = useTranslation();
  const hostname = window.location.origin;
  const [slug, setSlug] = useState(
    projectName.toLowerCase().replace(/\s+/g, '-')
  ); // Initialize slug with project name

  const handleSlugChange = (event) => {
    setSlug(event.target.value);
  };

  const handleEditSlug = () => {
    const newUrl = `${hostname}/${ownerUsername}/sketches/${slug}`;

    window.history.pushState({}, '', newUrl);

    // Provide feedback to the user
    // use alerts, notifications, or a message within the modal
    alert('Slug updated successfully!');
  };

  return (
    <div className="share-modal">
      <h3 className="share-modal__project-name">{projectName}</h3>
      <CopyableInput
        label={t('ShareModal.Embed')}
        value={`<iframe src="${hostname}/${ownerUsername}/full/${projectId}"></iframe>`}
      />
      <CopyableInput
        label={t('ShareModal.Fullscreen')}
        hasPreviewLink
        value={`${hostname}/${ownerUsername}/full/${projectId}`}
      />
      <div className="edit-slug">
        <label htmlFor="slug">{t('ShareModal.EditSlug')}</label>
        <input type="text" id="slug" value={slug} onChange={handleSlugChange} />
        <button onClick={handleEditSlug}>{t('ShareModal.SaveSlug')}</button>
      </div>
    </div>
  );
};

ShareModal.propTypes = {
  projectId: PropTypes.string.isRequired,
  ownerUsername: PropTypes.string.isRequired,
  projectName: PropTypes.string.isRequired
};

export default ShareModal;
