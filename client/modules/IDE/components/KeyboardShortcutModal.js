import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
const exitUrl = require('../../../images/exit.svg');

function KeyboardShortcutModal(props) {
  return (
    <section className="keyboard-shortcuts">
      <header className="keyboard-shortcuts__header">
        <h2>Keyboard Shortcuts</h2>
        <button className="keyboard-shortcuts__close" onClick={props.closeModal}>
          <InlineSVG src={exitUrl} alt="Close Keyboard Shortcuts Overlay" />
        </button>
      </header>
      <ul>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">Shift + Tab</span>
          <span>Tidy</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">Command + [</span>
          <span>Indent Code Right</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">Command + ]</span>
          <span>Indent Code Left</span>
        </li>
        <li className="keyboard-shortcut-item">
          <span className="keyboard-shortcut__command">Command + /</span>
          <span>Comment Line</span>
        </li>
      </ul>
    </section>
  );
}

KeyboardShortcutModal.propTypes = {
  closeModal: PropTypes.func.isRequired
};

export default KeyboardShortcutModal;
