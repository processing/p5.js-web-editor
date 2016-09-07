import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
const exitUrl = require('../../../images/exit.svg');

function ShareModal(props) {
  const hostname = window.location.origin;
  return (
    <section className="share-modal">
      <header className="share-modal__header">
        <h2>Share Sketch</h2>
        <button className="about__exit-button" onClick={props.closeShareModal}>
          <InlineSVG src={exitUrl} alt="Close Share Overlay" />
        </button>
      </header>
      <div className="share-modal__section">
        <label className="share-modal__label">Embed</label>
        <input
          type="text"
          className="share-modal__input"
          value={`<iframe src="${hostname}/embed/${props.projectId}"></iframe>`}
        />
      </div>
      <div className="share-modal__section">
        <label className="share-modal__label">Fullscreen</label>
        <input
          type="text"
          className="share-modal__input"
          value={`${hostname}/full/${props.projectId}`}
        />
      </div>
      <div className="share-modal__section">
        <label className="share-modal__label">Edit</label>
        <input
          type="text"
          className="share-modal__input"
          value={`${hostname}/projects/${props.projectId}`}
        />
      </div>
    </section>
  );
}

ShareModal.propTypes = {
  projectId: PropTypes.string.isRequired,
  closeShareModal: PropTypes.func.isRequired
};

export default ShareModal;
