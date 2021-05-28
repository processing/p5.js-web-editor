import React, { useEffect, useRef } from 'react';
// import { Compartment } from '@codemirror/state';
import { EditorState, basicSetup } from '@codemirror/basic-setup';
import { EditorView, keymap } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { defaultTabBinding } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { cpp } from '@codemirror/lang-cpp';
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
        basicSetup,
        getLanguageMode(file.name),
        keymap.of([defaultTabBinding]),
        EditorState.tabSize.of(2),
        ...customExtensions
      ]
    });
  }
  return state[file.id];
}

const fileStates = {};

export default function Editor({ provideController }) {
  const sidebarIsExpanded = useSelector((state) => state.ide.sidebarIsExpanded);
  const file = useSelector(getSelectedFile);
  const isUserOwner = useSelector(getIsUserOwner);
  const lintMessages = useSelector(
    (state) => state.editorAccessibility.lintMessages
  );
  const autorefresh = useSelector((state) => state.preferences.autorefresh);
  const isPlaying = useSelector((state) => state.ide.isPlaying);
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
    editor.current.setState(getFileState(fileStates, file, [onUpdate()]));
  }, [file.id]);

  // stub this out for now
  provideController({
    tidyCode: () => {},
    showFind: () => {},
    showReplace: () => {},
    getContent: () => {}
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
