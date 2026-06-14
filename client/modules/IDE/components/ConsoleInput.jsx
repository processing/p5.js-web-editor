import PropTypes from 'prop-types';
import React, { useRef, useEffect } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, highlightSpecialChars, keymap } from '@codemirror/view';
import { bracketMatching, syntaxHighlighting } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';

import { useDispatch } from 'react-redux';
import { Encode } from 'console-feed';

import RightArrowIcon from '../../../images/right-arrow.svg';
import { dispatchConsoleEvent } from '../actions/console';
import { dispatchMessage, MessageTypes } from '../../../utils/dispatcher';
import { highlightStyle } from './Editor/utils/highlightStyle';

// heavily inspired by
// https://github.com/codesandbox/codesandbox-client/blob/92a1131f4ded6f7d9c16945dc7c18aa97c8ada27/packages/app/src/app/components/Preview/DevTools/Console/Input/index.tsx

// TODO(connie): Add theme support?
function ConsoleInput({ theme, fontSize }) {
  const commandHistory = useRef([]);
  const commandCursor = useRef(-1);
  const codemirrorContainer = useRef(null);
  const cmView = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const enterKeymap = {
      key: 'Enter',
      shiftKey: () => false, // Treat like a normal Enter key press if the Shift key is held down.
      preventDefault: true,
      stopPropogation: true,
      run: (view) => {
        const value = view.state.doc.toString().trim();
        if (value === '' || view.state.selection.main.empty === false)
          return false;

        const messages = [
          { log: Encode({ method: 'command', data: [value] }) }
        ];
        const consoleEvent = [{ method: 'command', data: [value] }];

        dispatchMessage({
          type: MessageTypes.EXECUTE,
          payload: { source: 'console', messages }
        });

        dispatch(dispatchConsoleEvent(consoleEvent));
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: '' }
        });
        commandHistory.current.unshift(value);
        commandCursor.current = -1;
        return true;
      }
    };

    const upArrowKeymap = {
      key: 'ArrowUp',
      run: (view) => {
        // Just let the cursor go up if we have a multiline input
        // and the cursor isn't at the first line.
        const currentLine = view.state.doc.lineAt(
          view.state.selection.main.head
        ).number;
        // CM lines are 1-indexed, so the first line is 1.
        if (currentLine > 1) return false;

        const newCursor = Math.min(
          commandCursor.current + 1,
          commandHistory.current.length - 1
        );
        const newValue = commandHistory.current[newCursor] || '';
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: newValue }
        });
        const newCursorPos = newValue.length;
        view.dispatch({
          selection: { anchor: newCursorPos, head: newCursorPos }
        });
        commandCursor.current = newCursor;
        return true;
      }
    };

    const downArrowKeymap = {
      key: 'ArrowDown',
      run: (view) => {
        // Just let the cursor go down if we have a multiline input
        // and the cursor isn't at the last line.
        const currentLine = view.state.doc.lineAt(
          view.state.selection.main.head
        ).number;
        const docLength = view.state.doc.lines;
        if (currentLine !== docLength) return false;

        const newCursor = Math.max(commandCursor.current - 1, -1);
        const newValue = commandHistory.current[newCursor] || '';
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: newValue }
        });
        const newCursorPos = newValue.length;
        view.dispatch({
          selection: { anchor: newCursorPos, head: newCursorPos }
        });
        commandCursor.current = newCursor;
        return true;
      }
    };

    const cmState = EditorState.create({
      extensions: [
        history(),
        highlightSpecialChars(),
        bracketMatching(),
        closeBrackets(),
        syntaxHighlighting(highlightStyle),
        javascript(),
        keymap.of([
          enterKeymap,
          upArrowKeymap,
          downArrowKeymap,
          ...defaultKeymap,
          ...closeBracketsKeymap,
          ...historyKeymap
        ])
      ]
    });
    cmView.current = new EditorView({
      state: cmState,
      parent: codemirrorContainer.current
    });
  }, []);

  return (
    <div className="console__input">
      <div
        className="console-active__arrow-container"
        style={{ height: `${fontSize * 1.3333}px` }}
      >
        <RightArrowIcon
          className="console-active__arrow"
          focusable="false"
          aria-hidden="true"
          style={{
            width: `${fontSize}px`,
            height: `${fontSize * 0.57}px`
          }}
        />
      </div>
      <div
        ref={codemirrorContainer}
        className="console__editor"
        style={{ fontSize: `${fontSize}px` }}
      />
    </div>
  );
}

ConsoleInput.propTypes = {
  theme: PropTypes.string.isRequired,
  fontSize: PropTypes.number.isRequired
};

export default ConsoleInput;
