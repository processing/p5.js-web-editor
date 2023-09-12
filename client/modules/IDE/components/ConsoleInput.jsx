import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import CodeMirror from 'codemirror';
import { Encode } from 'console-feed';
import RightArrowIcon from '../../../images/right-arrow.svg';
import { dispatchMessage, MessageTypes } from '../../../utils/dispatcher';

function ConsoleInput({ theme, dispatchConsoleEvent, fontSize }) {
  const [commandHistory, setCommandHistory] = useState([]);
  const [commandCursor, setCommandCursor] = useState(-1);
  const codemirrorContainer = useRef(null);

  useEffect(() => {
    let cm = CodeMirror(codemirrorContainer.current, {
      theme: `p5-${theme}`,
      scrollbarStyle: null,
      keymap: 'sublime',
      mode: 'javascript',
      inputStyle: 'contenteditable'
    });

    cm.on('keydown', (editor, e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const value = editor.getValue();
        if (value.trim() === '') {
          return false;
        }
        const messages = [
          { log: Encode({ method: 'command', data: [value] }) }
        ];
        const consoleEvent = [{ method: 'command', data: [value] }];
        dispatchMessage({
          type: MessageTypes.EXECUTE,
          payload: {
            source: 'console',
            messages
          }
        });
        dispatchConsoleEvent(consoleEvent);
        editor.setValue('');
        setCommandCursor(-1);
        setCommandHistory([value, ...commandHistory]);
      } else if (e.key === 'ArrowUp') {
        const lineNumber = editor.getDoc().getCursor().line;
        if (lineNumber !== 0) {
          return false;
        }
        setCommandCursor((prevCursor) =>
          Math.min(prevCursor + 1, commandHistory.length - 1)
        );
        editor.getDoc().setValue(commandHistory[commandCursor + 1] || '');
        const cursorPos = editor.getDoc().getLine(0).length - 1;
        editor.getDoc().setCursor({ line: 0, ch: cursorPos });
      } else if (e.key === 'ArrowDown') {
        const lineNumber = editor.getDoc().getCursor().line;
        const lineCount = editor.getValue().split('\n').length;
        if (lineNumber + 1 !== lineCount) {
          return false;
        }
        setCommandCursor((prevCursor) => Math.max(prevCursor - 1, -1));
        editor.getDoc().setValue(commandHistory[commandCursor - 1] || '');
        const newLineCount = editor.getValue().split('\n').length;
        const newLine = editor.getDoc().getLine(newLineCount);
        const cursorPos = newLine ? newLine.length - 1 : 1;
        editor.getDoc().setCursor({ line: lineCount, ch: cursorPos });
      }
      return true;
    });

    cm.getWrapperElement().style['font-size'] = `${fontSize}px`;

    return () => {
      cm = null;
    };
  }, [theme, dispatchConsoleEvent, fontSize, commandHistory, commandCursor]);

  useEffect(() => {
    if (codemirrorContainer.current) {
      const cm = CodeMirror.fromTextArea(codemirrorContainer.current, {
        theme: `p5-${theme}`,
        scrollbarStyle: null,
        keymap: 'sublime',
        mode: 'javascript',
        inputStyle: 'contenteditable'
      });

      cm.setSize(null, `${fontSize}px`);

      return () => {
        cm.toTextArea();
      };
    }
    return null;
  }, [theme, fontSize]);

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
      <textarea
        ref={codemirrorContainer}
        className="console__editor"
        rows="1"
      />
    </div>
  );
}

ConsoleInput.propTypes = {
  theme: PropTypes.string.isRequired,
  dispatchConsoleEvent: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired
};

export default ConsoleInput;
