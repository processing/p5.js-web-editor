import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';

const exitUrl = require('../../../images/exit.svg');

class ShareModal extends React.Component {
  componentDidMount() {
    this.shareModal.focus();
  }
  render() {
    const hostname = window.location.origin;
    return (
      <section className="share-modal" ref={(element) => { this.shareModal = element; }} tabIndex="0">
        <header className="share-modal__header">
          <h2>Share Sketch</h2>
          <button className="about__exit-button" onClick={this.props.closeShareModal}>
            <InlineSVG src={exitUrl} alt="Close Share Overlay" />
          </button>
        </header>
        <div className="share-modal__section">
          <label className="share-modal__label" htmlFor="share-modal__embed">Embed</label>
          <input
            type="text"
            className="share-modal__input"
            id="share-modal__embed"
            value={`<iframe src="${hostname}/embed/${this.props.projectId}"></iframe>`}
          />
        </div>
        <div className="share-modal__section">
          <label className="share-modal__label" htmlFor="share-modal__fullscreen">Fullscreen</label>
          <input
            type="text"
            className="share-modal__input"
            id="share-modal__fullscreen"
            value={`${hostname}/full/${this.props.projectId}`}
          />
        </div>
        <div className="share-modal__section">
          <label className="share-modal__label" htmlFor="share-modal__edit">Edit</label>
          <input
            type="text"
            className="share-modal__input"
            id="share-modal__edit"
            value={`${hostname}/${this.props.ownerUsername}/sketches/${this.props.projectId}`}
          />
        </div>
      </section>
    );
  }
}

ShareModal.propTypes = {
  projectId: PropTypes.string.isRequired,
  closeShareModal: PropTypes.func.isRequired,
  ownerUsername: PropTypes.string.isRequired
};

export default ShareModal;
