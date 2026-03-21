import { EditorState, Compartment } from '@codemirror/state';
import {
  EditorView,
  lineNumbers as lineNumbersExt,
  highlightActiveLine,
  highlightActiveLineGutter,
  gutters,
  keymap,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor
} from '@codemirror/view';
import {
  foldGutter,
  foldKeymap,
  bracketMatching,
  indentOnInput,
  syntaxHighlighting
} from '@codemirror/language';
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap
} from '@codemirror/autocomplete';
import {
  highlightSelectionMatches,
  search,
  searchKeymap
} from '@codemirror/search';
import {
  defaultKeymap,
  history,
  historyKeymap,
  insertTab,
  indentLess
} from '@codemirror/commands';
import { lintGutter } from '@codemirror/lint';
import {
  expandAbbreviation,
  abbreviationTracker
} from '@emmetio/codemirror6-plugin';

import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { linter } from '@codemirror/lint';
import { JSHINT } from 'jshint';
import { HTMLHint } from 'htmlhint';
import { CSSLint } from 'csslint';
import { emmetConfig } from '@emmetio/codemirror6-plugin';
import { color as colorPicker } from '@connieye/codemirror-color-picker';

import p5JavaScript from './p5JavaScript';
import { tidyCodeWithPrettier } from './tidier';
import { highlightStyle } from './highlightStyle';
import { errorDecorationStateField } from './consoleErrorDecoration';

// ----- TODOS -----
// - JSON linter
// - shader syntax highlighting
// - add docstrings for all exported functions

/** Detects what mode the file is based on the name. */
export function getFileMode(fileName) {
  let mode;
  if (fileName.match(/.+\.js$/i)) {
    mode = 'javascript';
  } else if (fileName.match(/.+\.css$/i)) {
    mode = 'css';
  } else if (fileName.match(/.+\.(html)$/i)) {
    mode = 'html';
  } else if (fileName.match(/.+\.(xml)$/i)) {
    mode = 'xml';
  } else if (fileName.match(/.+\.json$/i)) {
    mode = 'application/json';
  } else if (fileName.match(/.+\.(frag|glsl)$/i)) {
    mode = 'x-shader/x-fragment';
  } else if (fileName.match(/.+\.(vert|stl|mtl)$/i)) {
    mode = 'x-shader/x-vertex';
  } else {
    mode = 'text/plain';
  }
  return mode;
}

function getFileLanguage(fileName) {
  const fileMode = getFileMode(fileName);

  switch (fileMode) {
    case 'javascript':
      return p5JavaScript;
    case 'css':
      return css;
    case 'html':
      return html;
    case 'xml':
      return xml;
    case 'application/json':
      return json;
    default:
      return null;
  }
}

function makeCssLinter(callback) {
  return (view) => {
    const documentContent = view.state.doc.toString();
    const { messages } = CSSLint.verify(documentContent, {});
    const diagnostics = [];
    messages.forEach((message) => {
      if (!message) return;

      const {
        line: messageLine,
        col: messageCharacter,
        type: messageType,
        message: messageText
      } = message;
      const cmLine = view.state.doc.line(messageLine);

      // TODO: Can we to do the to/from smarter?
      diagnostics.push({
        from: cmLine.from + messageCharacter - 1,
        to: cmLine.from + messageCharacter,
        severity: messageType,
        message: messageText
      });
    });

    if (callback) callback(diagnostics);

    return diagnostics;
  };
}

// https://github.com/codemirror/codemirror5/blob/master/addon/lint/html-lint.js
const HTMLHINT_OPTIONS = {
  'tagname-lowercase': true,
  'attr-lowercase': true,
  'attr-value-double-quotes': true,
  'doctype-first': false,
  'tag-pair': true,
  'spec-char-escape': true,
  'id-unique': true,
  'src-not-empty': true,
  'attr-no-duplication': true
};

function makeHtmlLinter(callback) {
  return (view) => {
    const documentContent = view.state.doc.toString();

    const messages = HTMLHint.verify(documentContent, HTMLHINT_OPTIONS) || [];

    const diagnostics = [];
    messages.forEach((message) => {
      if (!message) return;

      const {
        line: messageLine,
        col: messageCharacter,
        type: messageType,
        message: messageText
      } = message;
      const cmLine = view.state.doc.line(messageLine);

      // TODO: Can we to do the to/from smarter?
      diagnostics.push({
        from: cmLine.from + messageCharacter - 1,
        to: cmLine.from + messageCharacter,
        severity: messageType,
        message: messageText
      });
    });

    if (callback) callback(diagnostics);

    return diagnostics;
  };
}

const JSHINT_OPTIONS = {
  asi: true,
  eqeqeq: false,
  '-W041': false,
  esversion: 11
};

// TODO: Consider using ESLINT instead
function makeJsLinter(callback) {
  return (view) => {
    const documentContent = view.state.doc.toString();

    // Run JSHINT
    JSHINT(documentContent, JSHINT_OPTIONS);
    const { errors } = JSHINT;

    // Return errors
    const diagnostics = [];
    errors.forEach((error) => {
      if (!error) return;

      const { line: errorLine, character: errorCharacter, evidence } = error;
      const cmLine = view.state.doc.line(errorLine);

      // https://github.com/codemirror/codemirror5/blob/master/addon/lint/javascript-lint.js
      const start = errorCharacter - 1;
      let end = start + 1;
      if (evidence) {
        const index = evidence.substring(start).search(/.\b/);
        if (index > -1) {
          end += index;
        }
      }

      diagnostics.push({
        from: cmLine.from + start,
        to: cmLine.from + end,
        severity: error.code.startsWith('W') ? 'warning' : 'error',
        message: error.reason
      });
    });

    if (callback) callback(diagnostics);

    return diagnostics;
  };
}

function getFileLinter(fileName, callback) {
  const fileMode = getFileMode(fileName);

  switch (fileMode) {
    case 'javascript':
      return linter(makeJsLinter(callback));
    case 'html':
      return linter(makeHtmlLinter(callback));
    case 'css':
      return linter(makeCssLinter(callback));
    default:
      return null;
  }
}

function getFileEmmetConfig(fileName) {
  const fileMode = getFileMode(fileName);

  switch (fileMode) {
    case 'html':
      return emmetConfig.of({ syntax: 'html' });
    case 'css':
      return emmetConfig.of({ syntax: 'css' });
    default:
      return null;
  }
}

function getColorPickerAtSelection(view) {
  const { head } = view.state.selection.main;
  const { node } = view.domAtPos(head);

  const startEl =
    node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;

  const lineEl = startEl?.closest('.cm-line');

  return (
    lineEl?.querySelector('input[type="color"]:not(:disabled)') ||
    view.contentDOM.querySelector('input[type="color"]:not(:disabled)')
  );
}

function openColorPickerWithKeyboard(view) {
  const picker = getColorPickerAtSelection(view);

  if (!picker || picker.disabled) {
    return false;
  }

  picker.focus();

  if (typeof picker.showPicker === 'function') {
    picker.showPicker();
  } else {
    picker.click();
  }

  return true;
}

// Extra custom keymaps.
// TODO: We need to add sublime mappings + other missing extra mappings here.
const extraKeymaps = [{ key: 'Tab', run: insertTab, shift: indentLess }];
const emmetKeymaps = [{ key: 'Tab', run: expandAbbreviation }];

export const AUTOCOMPLETE_OPTIONS = {
  tooltipClass: () => 'CodeMirror-hints',
  optionClass: () => 'CodeMirror-hint',
  closeOnBlur: false
};

/**
 * Creates a new CodeMirror editor state with configurations,
 * extensions, and keymaps tailored to the file type and settings.
 *
 * Returns a "file state" object containing the CodeMirror state and compartments.
 */
export function createNewFileState(filename, document, settings) {
  const {
    linewrap,
    lineNumbers,
    autocomplete,
    autocloseBracketsQuotes,
    onUpdateLinting,
    onViewUpdate
  } = settings;
  const lineNumbersCpt = new Compartment();
  const lineWrappingCpt = new Compartment();
  const closeBracketsCpt = new Compartment();
  const autocompleteCpt = new Compartment();

  // Depending on the file mode, we have a different tidier function.
  const mode = getFileMode(filename);
  const fileExtraKeymaps = [...extraKeymaps];

  fileExtraKeymaps.push({
    key: 'Mod-k',
    run: (view) => {
      if (mode !== 'css') {
        return false;
      }

      return openColorPickerWithKeyboard(view);
    }
  });

  fileExtraKeymaps.push({
    key: `Shift-Mod-F`,
    run: (cmView) => tidyCodeWithPrettier(cmView, mode)
  });

  const keymaps = [
    fileExtraKeymaps,
    closeBracketsKeymap,
    defaultKeymap,
    historyKeymap,
    foldKeymap,
    searchKeymap
  ];

  // https://github.com/codemirror/basic-setup/blob/main/src/codemirror.ts
  const extensions = [
    // The first few extensions can be toggled on or off.
    lineNumbersCpt.of(lineNumbers ? lineNumbersExt() : []),
    lineWrappingCpt.of(linewrap ? EditorView.lineWrapping : []),
    closeBracketsCpt.of(autocloseBracketsQuotes ? closeBrackets() : []),
    autocompleteCpt.of(
      autocomplete ? autocompletion(AUTOCOMPLETE_OPTIONS) : []
    ),

    // Everything below here should always be on.
    history(),
    search(),
    // Highlight extensions
    highlightActiveLine(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    highlightSelectionMatches(),
    syntaxHighlighting(highlightStyle),
    // Selection extensions
    drawSelection(),
    rectangularSelection(),
    dropCursor(),
    crosshairCursor(),
    EditorState.allowMultipleSelections.of(true),
    // Gutter extensions
    gutters({ fixed: false }),
    foldGutter(),
    // Misc extensions
    indentOnInput(),
    bracketMatching(),
    errorDecorationStateField,

    // Setup the event listeners on the CodeMirror instance.
    EditorView.updateListener.of(onViewUpdate)
  ];

  // Only enable the color picker for Javascript and CSS, which
  // have both been tested.
  const fileMode = getFileMode(filename);
  if (fileMode === 'javascript' || fileMode === 'css') {
    extensions.push(colorPicker);
  }

  const fileLanguage = getFileLanguage(filename);
  const fileLinter = getFileLinter(filename, onUpdateLinting);
  const fileEmmetConfig = getFileEmmetConfig(filename);

  if (fileLanguage) {
    extensions.push(fileLanguage());
  }
  if (fileLinter) {
    extensions.push(fileLinter);
    extensions.push(lintGutter());
  }

  // If it's HTML or CSS, we add some emmet-specific configs.
  if (fileEmmetConfig) {
    extensions.push(fileEmmetConfig);
    extensions.push(abbreviationTracker());
    keymaps.push(emmetKeymaps);
  }

  // Now add the keymaps...
  extensions.push(keymap.of(keymaps.flat()));

  // Create the state with document content if we have it.
  const stateOptions = {
    extensions
  };
  if (document) {
    stateOptions.doc = document;
  }

  const cmState = EditorState.create(stateOptions);
  return {
    cmState,
    lineNumbersCpt,
    lineWrappingCpt,
    closeBracketsCpt,
    autocompleteCpt
  };
}

/**
 * Given a reconfigure effect, this function will update all
 * of the file states.
 *
 * We need to do this whenever the settings like line numbers
 * change, so it will get called in the useEffect hooks.
 */
export function updateFileStates({
  fileStates,
  cmView,
  file: currentFile,
  reconfigureEffect
}) {
  if (!fileStates) return;

  Object.entries(fileStates).forEach(([fileId, fileState]) => {
    // Either grab the current state from the view or saved in the fileStates.
    let { cmState } = fileState;
    if (fileId === currentFile.id) {
      cmState = cmView.state;
    }

    // Apply the new effects and grab the new state.
    const { state: newCmState } = cmState.update({
      effects: reconfigureEffect(fileState)
    });

    // Save the new states and update the view for the currently open file.
    fileStates[fileId].cmState = newCmState;
    if (fileId === currentFile.id) {
      cmView.setState(newCmState);
    }
  });
}
