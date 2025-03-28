import { useRef, useEffect } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/mode/css/css';
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/javascript-lint';
import 'codemirror/addon/lint/css-lint';
import 'codemirror/addon/lint/html-lint';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/addon/comment/comment';
import 'codemirror/keymap/sublime';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/match-highlighter';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/selection/mark-selection';
import 'codemirror-colorpicker';

import { debounce } from 'lodash';
import emmet from '@emmetio/codemirror-plugin';

import { useEffectWithComparison } from '../../hooks/custom-hooks';
import { metaKey } from '../../../../utils/metaKey';
import { showHint } from './hinter';
import tidyCode from './tidier';
import getFileMode from './utils';

const INDENTATION_AMOUNT = 2;

emmet(CodeMirror);

/** This is a custom React hook that manages CodeMirror state. */
export default function useCodeMirror({
  theme,
  lineNumbers,
  linewrap,
  autocloseBracketsQuotes,
  setUnsavedChanges,
  setCurrentLine,
  hideRuntimeErrorWarning,
  updateFileContent,
  file,
  files,
  autorefresh,
  isPlaying,
  clearConsole,
  startSketch,
  autocompleteHinter,
  fontSize,
  onUpdateLinting
}) {
  // The codemirror instance.
  const cmInstance = useRef();
  // The current codemirror files.
  const docs = useRef();

  function onKeyUp() {
    const lineNumber = parseInt(cmInstance.current.getCursor().line + 1, 10);
    setCurrentLine(lineNumber);
  }

  function onKeyDown(_cm, e) {
    // Show hint
    const mode = cmInstance.current.getOption('mode');
    if (/^[a-z]$/i.test(e.key) && (mode === 'css' || mode === 'javascript')) {
      showHint(_cm, autocompleteHinter, fontSize);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      const selections = cmInstance.current.listSelections();

      if (selections.length > 1) {
        const firstPos = selections[0].head || selections[0].anchor;
        cmInstance.current.setSelection(firstPos);
        cmInstance.current.scrollIntoView(firstPos);
      } else {
        cmInstance.current.getInputField().blur();
      }
    }
  }

  // We have to create a ref for the file ID, or else the debouncer
  // will old onto an old version of the fileId and just overrwrite the initial file.
  const fileId = useRef();
  fileId.current = file.id;

  // When the file changes, update the file content and save status.
  function onChange() {
    setUnsavedChanges(true);
    hideRuntimeErrorWarning();
    updateFileContent(fileId.current, cmInstance.current.getValue());
    if (autorefresh && isPlaying) {
      clearConsole();
      startSketch();
    }
  }
  const debouncedOnChange = debounce(onChange, 1000);

  // When the container component enters the DOM, we want this function
  // to be called so we can setup the CodeMirror instance with the container.
  function setupCodeMirrorOnContainerMounted(container) {
    cmInstance.current = CodeMirror(container, {
      theme: `p5-${theme}`,
      lineNumbers,
      styleActiveLine: true,
      inputStyle: 'contenteditable',
      lineWrapping: linewrap,
      fixedGutter: false,
      foldGutter: true,
      foldOptions: { widget: '\u2026' },
      gutters: ['CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      keyMap: 'sublime',
      highlightSelectionMatches: true, // highlight current search match
      matchBrackets: true,
      emmet: {
        preview: ['html'],
        markTagPairs: true,
        autoRenameTags: true
      },
      autoCloseBrackets: autocloseBracketsQuotes,
      styleSelectedText: true,
      lint: {
        onUpdateLinting,
        options: {
          asi: true,
          eqeqeq: false,
          '-W041': false,
          esversion: 11
        }
      },
      colorpicker: {
        type: 'sketch',
        mode: 'edit'
      }
    });

    delete cmInstance.current.options.lint.options.errors;

    const replaceCommand =
      metaKey === 'Ctrl' ? `${metaKey}-H` : `${metaKey}-Option-F`;
    cmInstance.current.setOption('extraKeys', {
      Tab: (tabCm) => {
        if (!tabCm.execCommand('emmetExpandAbbreviation')) return;
        // might need to specify and indent more?
        const selection = tabCm.doc.getSelection();
        if (selection.length > 0) {
          tabCm.execCommand('indentMore');
        } else {
          tabCm.replaceSelection(' '.repeat(INDENTATION_AMOUNT));
        }
      },
      Enter: 'emmetInsertLineBreak',
      Esc: 'emmetResetAbbreviation',
      [`Shift-Tab`]: false,
      [`${metaKey}-Enter`]: () => null,
      [`Shift-${metaKey}-Enter`]: () => null,
      [`${metaKey}-F`]: 'findPersistent',
      [`Shift-${metaKey}-F`]: () => tidyCode(cmInstance.current),
      [`${metaKey}-G`]: 'findPersistentNext',
      [`Shift-${metaKey}-G`]: 'findPersistentPrev',
      [replaceCommand]: 'replace',
      // Cassie Tarakajian: If you don't set a default color, then when you
      // choose a color, it deletes characters inline. This is a
      // hack to prevent that.
      [`${metaKey}-K`]: (metaCm, event) =>
        metaCm.state.colorpicker.popup_color_picker({ length: 0 }),
      [`${metaKey}-.`]: 'toggleComment' // Note: most adblockers use the shortcut ctrl+.
    });

    // Setup the event listeners on the CodeMirror instance.
    cmInstance.current.on('change', debouncedOnChange);
    cmInstance.current.on('keyup', onKeyUp);
    cmInstance.current.on('keydown', onKeyDown);

    cmInstance.current.getWrapperElement().style['font-size'] = `${fontSize}px`;
  }

  // When settings change, we pass those changes into CodeMirror.
  useEffect(() => {
    cmInstance.current.getWrapperElement().style['font-size'] = `${fontSize}px`;
  }, [fontSize]);
  useEffect(() => {
    cmInstance.current.setOption('lineWrapping', linewrap);
  }, [linewrap]);
  useEffect(() => {
    cmInstance.current.setOption('theme', `p5-${theme}`);
  }, [theme]);
  useEffect(() => {
    cmInstance.current.setOption('lineNumbers', lineNumbers);
  }, [lineNumbers]);
  useEffect(() => {
    cmInstance.current.setOption('autoCloseBrackets', autocloseBracketsQuotes);
  }, [autocloseBracketsQuotes]);

  // Initializes the files as CodeMirror documents.
  function initializeDocuments() {
    docs.current = {};
    files.forEach((currentFile) => {
      if (currentFile.name !== 'root') {
        docs.current[currentFile.id] = CodeMirror.Doc(
          currentFile.content,
          getFileMode(currentFile.name)
        );
      }
    });
  }

  // When the files change, reinitialize the documents.
  useEffect(initializeDocuments, [files]);

  // When the file changes, we change the file mode and
  // make the CodeMirror call to swap out the document.
  useEffectWithComparison(
    (_, prevProps) => {
      const fileMode = getFileMode(file.name);
      if (fileMode === 'javascript') {
        // Define the new Emmet configuration based on the file mode
        const emmetConfig = {
          preview: ['html'],
          markTagPairs: false,
          autoRenameTags: true
        };
        cmInstance.current.setOption('emmet', emmetConfig);
      }
      const oldDoc = cmInstance.current.swapDoc(docs.current[file.id]);
      if (prevProps?.file) {
        docs.current[prevProps.file.id] = oldDoc;
      }
      cmInstance.current.focus();

      for (let i = 0; i < cmInstance.current.lineCount(); i += 1) {
        cmInstance.current.removeLineClass(
          i,
          'background',
          'line-runtime-error'
        );
      }
    },
    [file.id]
  );

  // Remove the CM listeners on component teardown.
  function teardownCodeMirror() {
    cmInstance.current.off('keyup', onKeyUp);
    cmInstance.current.off('change', debouncedOnChange);
    cmInstance.current.off('keydown', onKeyDown);
  }

  const getContent = () => {
    const content = cmInstance.current.getValue();
    const updatedFile = Object.assign({}, file, { content });
    return updatedFile;
  };

  const showFind = () => {
    cmInstance.current.execCommand('findPersistent');
  };

  const showReplace = () => {
    cmInstance.current.execCommand('replace');
  };

  return {
    setupCodeMirrorOnContainerMounted,
    teardownCodeMirror,
    cmInstance,
    getContent,
    showFind,
    showReplace
  };
}
