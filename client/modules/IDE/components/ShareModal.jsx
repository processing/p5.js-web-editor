import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CopyableInput from './CopyableInput';
// import getConfig from '../../../utils/getConfig';

const ShareModal = () => {
  const { t } = useTranslation();

  // TODO: store these as nested properties instead of top-level
  const projectId = useSelector((state) => state.ide.shareModalProjectId);
  const projectName = useSelector((state) => state.ide.shareModalProjectName);
  const ownerUsername = useSelector(
    (state) => state.ide.shareModalProjectUsername
  );

  const hostname = window.location.origin;
  // const previewUrl = getConfig('PREVIEW_URL');
  return (
    <div className="share-modal">
      <h3 className="share-modal__project-name">{projectName}</h3>
      <CopyableInput
        label={t('ShareModal.Embed')}
        value={`<iframe src="${hostname}/${ownerUsername}/full/${projectId}"></iframe>`}
      />
      {/* CAT removing due to phishing issues */}
      {/* <CopyableInput
        label={t('ShareModal.Present')}
        hasPreviewLink
        value={`${previewUrl}/${ownerUsername}/present/${projectId}`}
      /> */}
      <CopyableInput
        label={t('ShareModal.Fullscreen')}
        hasPreviewLink
        value={`${hostname}/${ownerUsername}/full/${projectId}`}
      />
      <CopyableInput
        label={t('ShareModal.Edit')}
        hasPreviewLink
        value={`${hostname}/${ownerUsername}/sketches/${projectId}`}
      />
    </div>
  );
};

export default ShareModal;
