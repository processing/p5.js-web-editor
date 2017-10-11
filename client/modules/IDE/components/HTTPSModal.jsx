import React from 'react';

function HTTPSModal() {
  return (
    <section className="help-modal">
      <div className="help-modal__section">
        <div>
          <p>Use the checkbox to choose whether this sketch should be loaded using HTTPS or HTTP.</p>
          <p>You should choose HTTPS if you need to:</p>
          <ul>
            <li>access a webcam or microphone</li>
            <li>access an API served over HTTPS</li>
          </ul>
          <p>Choose HTTP if you need to:</p>
          <ul>
            <li>access an API served over HTTP</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default HTTPSModal;
