import React, { useEffect, useRef } from 'react';
// import { EditorState } from '@codemirror/state';
import { EditorState, basicSetup } from '@codemirror/basic-setup';
import { EditorView, keymap } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { defaultTabBinding } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
// import styled from 'styled-components';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import Header from './Header';
import EditorAccessibility from './EditorAccessibility';
import { getIsUserOwner } from '../../selectors/users';
// import getSelectedFile from '../../selectors/files';

function getSelectedFile(state) {
  return (
    state.files.find((file) => file.isSelectedFile) ||
    state.files.find((file) => file.name === 'sketch.js') ||
    state.files.find((file) => file.name !== 'root')
  );
}

export default function Editor({ provideController }) {
  const sidebarIsExpanded = useSelector((state) => state.ide.sidebarIsExpanded);
  const file = useSelector(getSelectedFile);
  const isUserOwner = useSelector(getIsUserOwner);
  const lintMessages = useSelector(
    (state) => state.editorAccessibility.lintMessages
  );
  const editorSectionClass = classNames({
    editor: true,
    'sidebar--contracted': !sidebarIsExpanded
  });
  const editorHolderClass = classNames({
    'editor-holder': true,
    'editor-holder--hidden': file.fileType === 'folder' || file.url
  });

  const editorHolder = useRef(null);

  useEffect(() => {
    const state = EditorState.create({
      doc: file.content,
      extensions: [
        basicSetup,
        javascript(),
        keymap.of([defaultTabBinding]),
        EditorState.tabSize.of(2)
      ]
    });

    const view = new EditorView({
      state,
      parent: editorHolder.current
    });
  }, []);

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
