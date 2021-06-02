import React, { useEffect, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
// import { EditorState, basicSetup } from '@codemirror/basic-setup';
import {
  EditorView,
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine
} from '@codemirror/view';
import { history, historyKeymap } from '@codemirror/history';
import { foldGutter, foldKeymap } from '@codemirror/fold';
import { indentOnInput } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { defaultKeymap, defaultTabBinding } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/matchbrackets';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { cpp } from '@codemirror/lang-cpp';
import { lineNumbers, highlightActiveLineGutter } from '@codemirror/gutter';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { commentKeymap } from '@codemirror/comment';
import { rectangularSelection } from '@codemirror/rectangular-selection';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { lintKeymap } from '@codemirror/lint';
// import styled from 'styled-components';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import Header from './Header';
import EditorAccessibility from './EditorAccessibility';
import { getIsUserOwner } from '../../selectors/users';
// import getSelectedFile from '../../selectors/files';
import { setUnsavedChanges, startRefreshSketch } from '../../actions/ide';
import { updateFileContent } from '../../actions/files';
import { clearConsole } from '../../actions/console';

const fileStates = {};
const lineNumbersState = new Compartment();

const editorTheme = EditorView.theme({
  '&': { maxHeight: '100%', height: '100%' },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-content, .cm-gutter': { minHeight: '100%' }
});

function getSelectedFile(state) {
  return (
    state.files.find((file) => file.isSelectedFile) ||
    state.files.find((file) => file.name === 'sketch.js') ||
    state.files.find((file) => file.name !== 'root')
  );
}

function getLanguageMode(fileName) {
  let mode;
  if (fileName.match(/.+\.js$/i)) {
    mode = javascript();
  } else if (fileName.match(/.+\.css$/i)) {
    mode = css();
  } else if (fileName.match(/.+\.(html|xml)$/i)) {
    mode = html();
  } else if (fileName.match(/.+\.json$/i)) {
    mode = json();
  } else if (fileName.match(/.+\.(frag|vert)$/i)) {
    mode = cpp();
  } else {
    mode = null;
  }
  return mode;
}

function getFileState(state, file, customExtensions = []) {
  if (!state[file.id]) {
    state[file.id] = EditorState.create({
      doc: file.content,
      // maybe will have to copy over extensions? idk
      // store extensions separately? probs
      extensions: [
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        defaultHighlightStyle.fallback,
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...commentKeymap,
          ...completionKeymap,
          ...lintKeymap,
          defaultTabBinding
        ]),
        getLanguageMode(file.name),
        EditorState.tabSize.of(2),
        editorTheme,
        lineNumbersState.of(lineNumbers()),
        ...customExtensions
      ]
    });
  }
  return state[file.id];
}

export default function Editor({ provideController }) {
  const sidebarIsExpanded = useSelector((state) => state.ide.sidebarIsExpanded);
  const file = useSelector(getSelectedFile);
  const isUserOwner = useSelector(getIsUserOwner);
  const lintMessages = useSelector(
    (state) => state.editorAccessibility.lintMessages
  );
  const autorefresh = useSelector((state) => state.preferences.autorefresh);
  const isPlaying = useSelector((state) => state.ide.isPlaying);
  const lineNumbersEnabled = useSelector(
    (state) => state.preferences.lineNumbers
  );
  const dispatch = useDispatch();
  const editorSectionClass = classNames({
    editor: true,
    'sidebar--contracted': !sidebarIsExpanded
  });
  const editorHolderClass = classNames({
    'editor-holder': true,
    'editor-holder--hidden': file.fileType === 'folder' || file.url
  });

  const editorHolder = useRef(null);
  const editor = useRef(null);

  // does this need to be debounced??
  const onUpdate = () =>
    EditorView.updateListener.of((viewUpdate) => {
      // editor.current.state, or let's inspect viewUpdate
      if (viewUpdate.docChanged) {
        const { doc } = viewUpdate.state;
        const value = doc.toString();
        dispatch(setUnsavedChanges(true));
        dispatch(updateFileContent(file.id, value));
        fileStates[file.id] = viewUpdate.state;
        if (autorefresh && isPlaying) {
          dispatch(clearConsole());
          dispatch(startRefreshSketch());
        }
      }
    });

  // let view;

  // i think i need to create a new editor state for each file
  // Or, if the entire state (undo history, etc) should be reset
  // cm.setState(EditorState.create({doc: text, extensions: ...}))
  // but get rid of them when new project comes in
  useEffect(() => {
    const fileState = getFileState(fileStates, file, [onUpdate()]);
    // const fileState = getFileState(state, file);

    editor.current = new EditorView({
      state: fileState,
      parent: editorHolder.current
    });

    return () => {
      editor.current.destroy();
    };
  }, []);

  useEffect(() => {
    // how do i dispatch a change to a state that's not in the cm editor rn?
    // maybe state.update?
    // yes, which is literally the same function footprint
    const value = lineNumbersEnabled ? lineNumbers() : [];
    editor.current.dispatch({
      effects: lineNumbersState.reconfigure(value)
    });
    // need to iterate through all of the editor states and update them?
    // it says state.update returns a transaction... but how do i get the new state?
    // yes, it's in Transaction.state. cool cool.
  }, [lineNumbersEnabled]);

  useEffect(() => {
    editor.current.setState(getFileState(fileStates, file, [onUpdate()]));
  }, [file.id]);

  // stub this out for now
  provideController({
    tidyCode: () => {},
    showFind: () => {},
    showReplace: () => {},
    getContent: () => {
      const content = editor.current.state.doc.toString();
      const updatedFile = Object.assign({}, file, { content });
      return updatedFile;
    }
  });

  return (
    <section className={editorSectionClass}>
      <Header fileName={file.name} isUserOwner={isUserOwner} />
      <article ref={editorHolder} className={editorHolderClass}>
        <EditorAccessibility lintMessages={lintMessages} />
      </article>
    </section>
  );
}

Editor.propTypes = {
  provideController: PropTypes.func.isRequired
};
