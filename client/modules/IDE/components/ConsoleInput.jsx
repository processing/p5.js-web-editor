import PropTypes from 'prop-types';
import React, { useRef, useEffect, useState } from 'react';
import CodeMirror from 'codemirror';
import { useDispatch } from 'react-redux';
import { Encode } from 'console-feed';

import RightArrowIcon from '../../../images/right-arrow.svg';
import { dispatchConsoleEvent } from '../actions/console';
import { dispatchMessage, MessageTypes } from '../../../utils/dispatcher';

// heavily inspired by
// https://github.com/codesandbox/codesandbox-client/blob/92a1131f4ded6f7d9c16945dc7c18aa97c8ada27/packages/app/src/app/components/Preview/DevTools/Console/Input/index.tsx

function ConsoleInput({ theme, fontSize }) {
  const [commandHistory, setCommandHistory] = useState([]);
  const [commandCursor, setCommandCursor] = useState(-1);
  const codemirrorContainer = useRef(null);
  const cmInstance = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    cmInstance.current = CodeMirror(codemirrorContainer.current, {
      theme: `p5-${theme}`,
      scrollbarStyle: null,
      keymap: 'sublime',
      mode: 'javascript',
      inputStyle: 'contenteditable'
    });
  }, []);

  useEffect(() => {
    const handleEnterKey = (cm, e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();

        const value = cm.getValue().trim();
        if (value === '') return;

        const messages = [
          { log: Encode({ method: 'command', data: [value] }) }
        ];
        const consoleEvent = [{ method: 'command', data: [value] }];

        dispatchMessage({
          type: MessageTypes.EXECUTE,
          payload: { source: 'console', messages }
        });

        dispatch(dispatchConsoleEvent(consoleEvent));
        cm.setValue('');
        setCommandHistory([value, ...commandHistory]);
        setCommandCursor(-1);
      }
    };

    if (cmInstance.current) {
      cmInstance.current.on('keydown', handleEnterKey);
    }

    return () => {
      if (cmInstance.current) {
        cmInstance.current.off('keydown', handleEnterKey);
      }
    };
  }, [commandHistory]);

  useEffect(() => {
    const handleUpArrowKey = (cm, e) => {
      if (e.key === 'ArrowUp') {
        const lineNumber = cm.getDoc().getCursor().line;
        if (lineNumber !== 0) return;

        const newCursor = Math.min(
          commandCursor + 1,
          commandHistory.length - 1
        );
        cm.setValue(commandHistory[newCursor] || '');
        const cursorPos = cm.getDoc().getLine(0).length - 1;
        cm.getDoc().setCursor({ line: 0, ch: cursorPos });
        setCommandCursor(newCursor);
      }
    };

    if (cmInstance.current) {
      cmInstance.current.on('keydown', handleUpArrowKey);
    }

    return () => {
      if (cmInstance.current) {
        cmInstance.current.off('keydown', handleUpArrowKey);
      }
    };
  }, [commandCursor, commandHistory]);

  useEffect(() => {
    const handleArrowDownKey = (cm, e) => {
      if (e.key === 'ArrowDown') {
        const lineNumber = cm.getDoc().getCursor().line;
        const lineCount = cm.lineCount();
        if (lineNumber + 1 !== lineCount) return;

        const newCursor = Math.max(commandCursor - 1, -1);
        cm.setValue(commandHistory[newCursor] || '');
        const newLine = cm.getDoc().getLine(lineCount - 1);
        const cursorPos = newLine ? newLine.length - 1 : 1;
        cm.getDoc().setCursor({ line: lineCount - 1, ch: cursorPos });
        setCommandCursor(newCursor);
      }
    };

    if (cmInstance.current) {
      cmInstance.current.on('keydown', handleArrowDownKey);
    }

    return () => {
      if (cmInstance.current) {
        cmInstance.current.off('keydown', handleArrowDownKey);
      }
    };
  }, [commandCursor, commandHistory]);

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
