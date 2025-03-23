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

import { metaKey } from '../../../../utils/metaKey';
import { showHint } from './hinter';
import tidyCode from './tidier';

const INDENTATION_AMOUNT = 2;

emmet(CodeMirror);

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
  autorefresh,
  isPlaying,
  clearConsole,
  startSketch,
  autocompleteHinter,
  fontSize,
  onUpdateLinting
}) {
  const cmInstance = useRef();

  function onKeyUp() {
    console.log('keyup');
    const lineNumber = parseInt(cmInstance.current.getCursor().line + 1, 10);
    setCurrentLine(lineNumber);
  }

  function onKeyDown(_cm, e) {
    console.log('keydown');
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

  function onChange() {
    console.log('change');
    setUnsavedChanges(true);
    hideRuntimeErrorWarning();
    updateFileContent(file.id, cmInstance.current.getValue());
    if (autorefresh && isPlaying) {
      clearConsole();
      startSketch();
    }
  }
  const debouncedOnChange = debounce(onChange, 1000);

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

    console.log('setting up change handlers??', cmInstance.current);
    cmInstance.current.on('change', debouncedOnChange);
    cmInstance.current.on('keyup', onKeyUp);
    cmInstance.current.on('keydown', onKeyDown);

    cmInstance.current.getWrapperElement().style['font-size'] = `${fontSize}px`;
  }

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

  function teardownCodeMirror() {
    cmInstance.current.off('keyup', onKeyUp);
    cmInstance.current.off('change', onChange);
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
