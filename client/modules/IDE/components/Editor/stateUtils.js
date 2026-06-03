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
  closeBracketsKeymap,
  completionStatus,
  selectedCompletionIndex
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
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { linter } from '@codemirror/lint';
import { HTMLHint } from 'htmlhint';
import { CSSLint } from 'csslint';
import { emmetConfig } from '@emmetio/codemirror6-plugin';
import { color as colorPicker } from '@connieye/codemirror-color-picker';

import { esLint } from '@codemirror/lang-javascript';
import { Linter as ESLinter } from 'eslint-linter-browserify';
import { tidyCodeWithPrettier } from './tidier';
import p5JavaScript from './p5JavaScript';
import { highlightStyle } from './highlightStyle';
import { errorDecorationStateField } from './consoleErrorDecoration';

// ----- TODOS -----
// - shader syntax highlighting

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

      const start = cmLine.from + messageCharacter - 1;
      const end = cmLine.to;

      diagnostics.push({
        from: start,
        to: end,
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

const ESLINT_CONFIG = {
  languageOptions: {
    ecmaVersion: 2021
  },
  rules: {
    semi: 'off',
    eqeqeq: 'off'
  }
};

const eslint = new ESLinter();

function makeJsonLinter(callback) {
  const baseJsonLinter = jsonParseLinter();
  return (view) => {
    const diagnostics = baseJsonLinter(view);
    if (callback) callback(diagnostics);
    return diagnostics;
  };
}

function getFileLinter(fileName, callback) {
  const fileMode = getFileMode(fileName);

  switch (fileMode) {
    case 'javascript':
      return linter(esLint(eslint, ESLINT_CONFIG));
    case 'html':
      return linter(makeHtmlLinter(callback));
    case 'css':
      return linter(makeCssLinter(callback));
    case 'application/json':
      return linter(makeJsonLinter(callback));
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

function focusOnReferenceArrow(view) {
  if (completionStatus(view.state) !== 'active') return false;

  const selectedIndex = selectedCompletionIndex(view.state);
  if (selectedIndex == null || selectedIndex < 0) return false;

  const tooltip = view.dom.querySelector('.cm-tooltip-autocomplete');
  if (!tooltip) return false;

  const options = tooltip.querySelectorAll('li.CodeMirror-hint');
  const selectedOption = options[selectedIndex];
  if (!selectedOption) return false;

  const link = selectedOption.querySelector('.cm-completionRefLink');
  if (!link) return false;

  link.focus();
  link.classList.add('focused-hint-link');

  const cleanup = () => {
    link.classList.remove('focused-hint-link');
    link.removeEventListener('blur', cleanup);
  };
  link.addEventListener('blur', cleanup);

  return true;
}

// Extra custom keymaps.
// TODO: We need to add sublime mappings + other missing extra mappings here.
const extraKeymaps = [
  { key: 'ArrowRight', run: focusOnReferenceArrow },
  { key: 'Tab', run: insertTab, shift: indentLess }
];
const emmetKeymaps = [{ key: 'Tab', run: expandAbbreviation }];

/** Returns completion options configured for autocomplete. */
export const createAutocompleteOptions = (referenceBaseUrl) => ({
  selectOnOpen: false,
  tooltipClass: () => 'CodeMirror-hints',
  closeOnBlur: false,
  icons: false,

  // handle css classes
  optionClass(completion) {
    let className = 'CodeMirror-hint';

    if (completion.type) {
      className += ` hint-type-${completion.type}`;
    }

    if (completion.p5DocPath) {
      className += ' has-doc-link';
    }

    return className;
  },

  addToOptions: [
    {
      position: 60,
      render(completion) {
        const kind = document.createElement('span');
        kind.className = 'cm-completionKind';
        kind.textContent = completion.kindLabel || completion.type || '';
        return kind;
      }
    },
    {
      position: 80,
      render(completion, state, view) {
        if (!completion.p5DocPath) return null;

        // TODO: add in reference url version switching
        const link = document.createElement('a');
        link.className = 'cm-completionRefLink';
        link.href = `${referenceBaseUrl}/reference/p5/${completion.p5DocPath}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.tabIndex = -1;
        link.setAttribute('aria-label', `Open ${completion.label} reference`);

        link.innerHTML = `
          <span class="hint-hidden">open ${completion.label} reference</span>
          <span aria-hidden="true">&#10132;</span>
        `;

        link.addEventListener('mousedown', (event) => {
          event.preventDefault();
          event.stopPropagation();
        });

        link.addEventListener('click', (event) => {
          event.stopPropagation();
        });

        link.addEventListener('keydown', (event) => {
          if (event.key === 'ArrowLeft' || event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            link.classList.remove('focused-hint-link');
            view.focus();
          }
        });

        return link;
      }
    },
    {
      position: 100,
      render(completion) {
        if (!completion.blacklisted) return null;

        const warning = document.createElement('div');
        warning.className = 'cm-completionWarning';

        const icon = document.createElement('span');
        icon.className = 'cm-completionWarningIcon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '⚠️';

        const text = document.createElement('span');
        text.className = 'cm-completionWarningText';
        text.textContent = 'use with caution in this context';

        warning.appendChild(icon);
        warning.appendChild(text);

        return warning;
      }
    }
  ]
});

// Uses window.document explicitly to avoid shadowing by the `document`
// parameter in createNewFileState below.
function createFoldMarker(open) {
  const span = window.document.createElement('span');
  span.className = open ? 'cm-fold-open' : 'cm-fold-closed';
  return span;
}

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
    onViewUpdate,
    referenceBaseUrl,
    fontSize
  } = settings;
  const lineNumbersCpt = new Compartment();
  const lineWrappingCpt = new Compartment();
  const closeBracketsCpt = new Compartment();
  const autocompleteCpt = new Compartment();
  const fontSizeCpt = new Compartment();

  // Depending on the file mode, we have a different tidier function.
  // Keep this binding local to each file state so modes don't accumulate
  // across files via a shared module-level array.
  const mode = getFileMode(filename);

  const colorPickerKeymap = [];
  if (mode === 'css' || mode === 'javascript') {
    colorPickerKeymap.push({
      key: 'Mod-k',
      run: (view) => openColorPickerWithKeyboard(view)
    });
  }

  // Make a keymap for both uppercase and lowercase F, since
  // since browsers can differ in which one they send for the Shift-Mod-F shortcut.
  const fileTidyKeymap = [
    {
      key: 'Shift-Mod-F',
      run: (cmView) => {
        tidyCodeWithPrettier(cmView, mode);
        return true;
      }
    },
    {
      key: 'Shift-Mod-f',
      run: (cmView) => {
        tidyCodeWithPrettier(cmView, mode);
        return true;
      }
    }
  ];

  const keymaps = [
    extraKeymaps,
    colorPickerKeymap,
    fileTidyKeymap,
    closeBracketsKeymap,
    defaultKeymap,
    historyKeymap,
    foldKeymap,
    searchKeymap
  ];

  // https://github.com/codemirror/basic-setup/blob/main/src/codemirror.ts
  const extensions = [
    // The first few extensions can be toggled on or off.
    fontSizeCpt.of(EditorView.theme({ '&': { fontSize: `${fontSize}px` } })),
    lineNumbersCpt.of(lineNumbers ? lineNumbersExt() : []),
    lineWrappingCpt.of(linewrap ? EditorView.lineWrapping : []),
    closeBracketsCpt.of(autocloseBracketsQuotes ? closeBrackets() : []),
    autocompleteCpt.of(
      autocomplete
        ? autocompletion(createAutocompleteOptions(referenceBaseUrl))
        : []
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
    foldGutter({ markerDOM: createFoldMarker }),
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
    extensions.push(
      EditorView.domEventHandlers({
        paste(event, view) {
          setTimeout(() => {
            expandAbbreviation(view);
          }, 0);
        }
      })
    );
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
    autocompleteCpt,
    fontSizeCpt
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
