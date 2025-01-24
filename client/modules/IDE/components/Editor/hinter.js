import Fuse from 'fuse.js';
import CodeMirror from 'codemirror';
import { JSHINT } from 'jshint';
import { HTMLHint } from 'htmlhint';
import 'codemirror/addon/hint/css-hint';

import * as hinterDefinition from '../../../../utils/p5-hinter';
import '../show-hint'; // Remove for codemirror v6?

// Are we using these?????
window.JSHINT = JSHINT;
window.HTMLHint = HTMLHint;

const hinter = new Fuse(hinterDefinition.p5Hinter, {
  threshold: 0.05,
  keys: ['text']
});

/** Hides the hinter. */
export function hideHinter() {
  CodeMirror.showHint(this._cm, () => {}, {});
}

/** Shows a hint in the codemirror instance. */
export function showHint(cmInstance, autocompleteHinter, fontSize) {
  if (!autocompleteHinter) {
    CodeMirror.showHint(cmInstance, () => {}, {});
    return;
  }

  let focusedLinkElement = null;
  const setFocusedLinkElement = (set) => {
    if (set && !focusedLinkElement) {
      const activeItemLink = document.querySelector(
        `.CodeMirror-hint-active a`
      );
      if (activeItemLink) {
        focusedLinkElement = activeItemLink;
        focusedLinkElement.classList.add('focused-hint-link');
        focusedLinkElement.parentElement.parentElement.classList.add(
          'unfocused'
        );
      }
    }
  };
  const removeFocusedLinkElement = () => {
    if (focusedLinkElement) {
      focusedLinkElement.classList.remove('focused-hint-link');
      focusedLinkElement.parentElement.parentElement.classList.remove(
        'unfocused'
      );
      focusedLinkElement = null;
      return true;
    }
    return false;
  };

  const hintOptions = {
    _fontSize: fontSize,
    completeSingle: false,
    extraKeys: {
      'Shift-Right': (cm, e) => {
        const activeItemLink = document.querySelector(
          `.CodeMirror-hint-active a`
        );
        if (activeItemLink) activeItemLink.click();
      },
      Right: (cm, e) => {
        setFocusedLinkElement(true);
      },
      Left: (cm, e) => {
        removeFocusedLinkElement();
      },
      Up: (cm, e) => {
        const onLink = removeFocusedLinkElement();
        e.moveFocus(-1);
        setFocusedLinkElement(onLink);
      },
      Down: (cm, e) => {
        const onLink = removeFocusedLinkElement();
        e.moveFocus(1);
        setFocusedLinkElement(onLink);
      },
      Enter: (cm, e) => {
        if (focusedLinkElement) focusedLinkElement.click();
        else e.pick();
      }
    },
    closeOnUnfocus: false
  };

  if (cmInstance.options.mode === 'javascript') {
    CodeMirror.showHint(
      cmInstance,
      () => {
        const cursor = cmInstance.getCursor();
        const token = cmInstance.getTokenAt(cursor);

        const hints = hinter
          .search(token.string)
          .filter((h) => h.item.text[0] === token.string[0]);

        return {
          list: hints,
          from: CodeMirror.Pos(cursor.line, token.start),
          to: CodeMirror.Pos(cursor.line, cursor.ch)
        };
      },
      hintOptions
    );
  } else if (cmInstance.options.mode === 'css') {
    CodeMirror.showHint(cmInstance, CodeMirror.hint.css, hintOptions);
  }
}
