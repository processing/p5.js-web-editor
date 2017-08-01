import React, { PropTypes } from 'react';
// import AssetList from '../components/AssetList';

function ShareModal(props) {
  const {
    projectId,
    ownerUsername,
    projectName
  } = props;
  const hostname = window.location.origin;
  return (
    <div className="share-modal">
      <div className="sketch-name-label">
        {`${projectName}`}
      </div>
      <div className="share-modal__section">
        <label className="share-modal__label" htmlFor="share-modal__embed">Embed</label>
      </div>
      <div className="share-modal__section" id="text-field">
        <input
          type="text"
          className="share-modal__input"
          id="share-modal__embed"
          value={`<iframe src="${hostname}/embed/${projectId}"></iframe>`}
        />
      </div>
      <div className="share-modal__section">
        <label className="share-modal__label" htmlFor="share-modal__fullscreen">Fullscreen</label>
      </div>
      <div className="share-modal__section" id="text-field">
        <input
          type="text"
          className="share-modal__input"
          id="share-modal__fullscreen"
          value={`${hostname}/full/${projectId}`}
        />
      </div>
      <div className="share-modal__section">
        <label className="share-modal__label" htmlFor="share-modal__edit">Edit</label>
      </div>
      <div className="share-modal__section" id="text-field">
        <input
          type="text"
          className="share-modal__input"
          id="share-modal__edit"
          value={`${hostname}/${ownerUsername}/sketches/${projectId}`}
        />
      </div>
    </div>
  );
}

ShareModal.propTypes = {
  projectId: PropTypes.string.isRequired,
  ownerUsername: PropTypes.string.isRequired,
  projectName: PropTypes.string.isRequired
};

export default ShareModal;
