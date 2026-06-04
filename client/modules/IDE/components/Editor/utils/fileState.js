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
  bracketMatching,
  indentOnInput,
  syntaxHighlighting
} from '@codemirror/language';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { highlightSelectionMatches, search } from '@codemirror/search';
import { history } from '@codemirror/commands';
import { lintGutter, linter } from '@codemirror/lint';
import {
  expandAbbreviation,
  abbreviationTracker
} from '@emmetio/codemirror6-plugin';

import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { emmetConfig } from '@emmetio/codemirror6-plugin';
import { color as colorPicker } from '@connieye/codemirror-color-picker';

import { p5JavaScript } from './p5JavaScript';
import { highlightStyle } from './highlightStyle';
import { errorDecorationStateField } from './consoleErrorDecoration';
import {
  makeCssLinter,
  makeHtmlLinter,
  makeJsonLinter,
  makeJavascriptLinter
} from './linters';
import { emmetKeymaps, buildKeymaps } from './keymaps';
import {
  createAutocompleteOptions,
  createFoldMarker
} from './extensionCustomStyles';

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

function getFileLinter(fileName, callback) {
  const fileMode = getFileMode(fileName);

  switch (fileMode) {
    case 'javascript':
      return makeJavascriptLinter();
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

  const keymaps = buildKeymaps(mode);

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
  if (mode === 'javascript' || mode === 'css') {
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
