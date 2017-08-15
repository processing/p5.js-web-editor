import React, { PropTypes } from 'react';
// import AssetList from '../components/AssetList';
function copyToClipboard() {
  // event handler
  function copy(e) {
    // find target element
    const t = e.target;
    const c = t.dataset.copytarget;
    const inp = (c ? document.querySelector(c) : null);
    // is element selectable?
    if (inp && inp.select) {
    // select text
      inp.select();
      try {
        // copy text
        document.execCommand('copy');
        inp.blur();
        // copied animation
        t.classList.add('copied');
        if (t.id === 'share-modal__embed') {
          document.getElementById('embed').classList.remove('hide');
          document.getElementById('embed').classList.add('show');
          console.log(document.getElementById('embed').classList);
        }
        if (t.id === 'share-modal__fullscreen') {
          document.getElementById('fullscreen').classList.remove('hide');
          document.getElementById('fullscreen').classList.add('show');
          console.log(document.getElementById('fullscreen').classList);
        }
        if (t.id === 'share-modal__edit') {
          document.getElementById('edit').classList.remove('hide');
          document.getElementById('edit').classList.add('show');
          console.log(document.getElementById('edit').classList);
        }
        setTimeout(t.classList.remove('copied'), 1500);
      } catch (err) {
        alert('please press Ctrl/Cmd+C to copy');
      }
    }
  }
  // click events
  document.body.addEventListener('click', copy, true);
}

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
        <div className="hide talk-bubble tri-right round btm-left-in" id="embed">
          <div className="talktext">
            <p>Resource copied to clipboard!</p>
          </div>
        </div>
      </div>
      <div className="share-modal__section" id="text-field">
        <input
          onClick={() => { copyToClipboard(); }}
          type="text"
          className="share-modal__input"
          id="share-modal__embed"
          data-copytarget="#share-modal__embed"
          value={`<iframe src="${hostname}/embed/${projectId}"></iframe>`}
        />
      </div>
      <div className="share-modal__section">
        <label className="share-modal__label" htmlFor="share-modal__fullscreen">Fullscreen</label>
        <div className="hide talk-bubble tri-right round btm-left-in" id="fullscreen">
          <div className="talktext">
            <p>Resource copied to clipboard!</p>
          </div>
        </div>
      </div>
      <div className="share-modal__section" id="text-field">
        <input
          onClick={() => { copyToClipboard(); }}
          type="text"
          className="share-modal__input"
          id="share-modal__fullscreen"
          data-copytarget="#share-modal__fullscreen"
          value={`${hostname}/full/${projectId}`}
        />
      </div>
      <div className="share-modal__section">
        <label className="share-modal__label" htmlFor="share-modal__edit">Edit</label>
        <div className="hide talk-bubble tri-right round btm-left-in" id="edit">
          <div className="talktext">
            <p>Resource copied to clipboard!</p>
          </div>
        </div>
      </div>
      <div className="share-modal__section" id="text-field">
        <input
          onClick={() => { copyToClipboard(); }}
          type="text"
          className="share-modal__input"
          id="share-modal__edit"
          data-copytarget="#share-modal__edit"
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
