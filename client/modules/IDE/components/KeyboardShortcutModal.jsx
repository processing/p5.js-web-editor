import React, { PropTypes } from 'react';
import InlineSVG from 'react-inlinesvg';
const exitUrl = require('../../../images/exit.svg');

class KeyboardShortcutModal extends React.Component {
  componentDidMount() {
    this.isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1;
  }

  render() {
    return (
      <section className="keyboard-shortcuts">
        <header className="keyboard-shortcuts__header">
          <h2>Keyboard Shortcuts</h2>
          <button className="keyboard-shortcuts__close" onClick={this.props.closeModal}>
            <InlineSVG src={exitUrl} alt="Close Keyboard Shortcuts Overlay" />
          </button>
        </header>
        <ul title="keyboard shortcuts">
          <li className="keyboard-shortcut-item">
            <span className="keyboard-shortcut__command">Shift + Tab</span>
            <span>Tidy</span>
          </li>
          <li className="keyboard-shortcut-item">
            <span className="keyboard-shortcut__command">
              {this.isMac ? 'Command + S' : 'Control + S'}
            </span>
            <span>Save</span>
          </li>
          <li className="keyboard-shortcut-item">
            <span className="keyboard-shortcut__command">
              {this.isMac ? 'Command + [' : 'Control + ['}
            </span>
            <span>Indent Code Left</span>
          </li>
          <li className="keyboard-shortcut-item">
            <span className="keyboard-shortcut__command">
              {this.isMac ? 'Command + ]' : 'Control + ]'}
            </span>
            <span>Indent Code Right</span>
          </li>
          <li className="keyboard-shortcut-item">
            <span className="keyboard-shortcut__command">
              {this.isMac ? 'Command + /' : 'Control + /'}
            </span>
            <span>Comment Line</span>
          </li>
          <li className="keyboard-shortcut-item">
            <span className="keyboard-shortcut__command">
              {this.isMac ? 'Command + Enter' : 'Control + Enter'}</span>
            <span>Start Sketch</span>
          </li>
          <li className="keyboard-shortcut-item">
            <span className="keyboard-shortcut__command">
              {this.isMac ? 'Command + Shift + Enter' : 'Control + Shift + Enter'}
            </span>
            <span>Stop Sketch</span>
          </li>
          <li className="keyboard-shortcut-item">
            <span className="keyboard-shortcut__command">
              {this.isMac ? 'Command + Shift + 1' : 'Control + Shift + 1'}
            </span>
            <span>Turn On Text-based Canvas</span>
          </li>
          <li className="keyboard-shortcut-item">
            <span className="keyboard-shortcut__command">
              {this.isMac ? 'Command + Shift + 2' : 'Control + Shift + 2'}
            </span>
            <span>Turn Off Text-based Canvas</span>
          </li>
        </ul>
      </section>
    );
  }
}

KeyboardShortcutModal.propTypes = {
  closeModal: PropTypes.func.isRequired
};

export default KeyboardShortcutModal;
