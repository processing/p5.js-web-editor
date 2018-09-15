import React from 'react';
import {
  metaKeyName,
} from '../../../utils/metaKey';

function KeyboardShortcutModal() {
  return (
    <ul className="keyboard-shortcuts" title="keyboard shortcuts">
      <li className="keyboard-shortcut-item">
        <span className="keyboard-shortcut__command">{'\u21E7'} + Tab</span>
        <span>Tidy</span>
      </li>
      <li className="keyboard-shortcut-item">
        <span className="keyboard-shortcut__command">
          {metaKeyName} + S
        </span>
        <span>Save</span>
      </li>
      <li className="keyboard-shortcut-item">
        <span className="keyboard-shortcut__command">
          {metaKeyName} + F
        </span>
        <span>Find Text</span>
      </li>
      <li className="keyboard-shortcut-item">
        <span className="keyboard-shortcut__command">
          {metaKeyName} + G
        </span>
        <span>Find Next Text Match</span>
      </li>
      <li className="keyboard-shortcut-item">
        <span className="keyboard-shortcut__command">
          {metaKeyName} + {'\u21E7'} + G
        </span>
        <span>Find Previous Text Match</span>
      </li>
      <li className="keyboard-shortcut-item">
        <span className="keyboard-shortcut__command">
          {metaKeyName} + [
        </span>
        <span>Indent Code Left</span>
      </li>
      <li className="keyboard-shortcut-item">
        <span className="keyboard-shortcut__command">
          {metaKeyName} + ]
        </span>
        <span>Indent Code Right</span>
      </li>
      <li className="keyboard-shortcut-item">
        <span className="keyboard-shortcut__command">
          {metaKeyName} + /
        </span>
        <span>Comment Line</span>
      </li>
      <li className="keyboard-shortcut-item">
        <span className="keyboard-shortcut__command">
          {metaKeyName} + Enter
        </span>
        <span>Start Sketch</span>
      </li>
      <li className="keyboard-shortcut-item">
        <span className="keyboard-shortcut__command">
          {metaKeyName} + {'\u21E7'} + Enter
        </span>
        <span>Stop Sketch</span>
      </li>
      <li className="keyboard-shortcut-item">
        <span className="keyboard-shortcut__command">
          {metaKeyName} + {'\u21E7'} + 1
        </span>
        <span>Turn on Accessible Output</span>
      </li>
      <li className="keyboard-shortcut-item">
        <span className="keyboard-shortcut__command">
          {metaKeyName} + {'\u21E7'} + 2
        </span>
        <span>Turn off Accessible Output</span>
      </li>
    </ul>
  );
}

export default KeyboardShortcutModal;
