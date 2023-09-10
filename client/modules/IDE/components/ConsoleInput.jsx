import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CodeMirror from 'codemirror';
import { Encode } from 'console-feed';

import RightArrowIcon from '../../../images/right-arrow.svg';
import { dispatchMessage, MessageTypes } from '../../../utils/dispatcher';

const ConsoleInput = ({ theme, dispatchConsoleEvent, fontSize }) => {
  const [commandHistory, setCommandHistory] = useState([]);
  const [commandCursor, setCommandCursor] = useState(-1);

  const codemirrorContainerRef = useRef(null);
  const codemirrorRef = useRef(null);

  useEffect(() => {
    codemirrorRef.current = CodeMirror(codemirrorContainerRef.current, {
      theme: `p5-${theme}`,
      scrollbarStyle: null,
      keymap: 'sublime',
      mode: 'javascript',
      inputStyle: 'contenteditable',
    });

    const handleKeyDown = (cm, e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const value = cm.getValue();
        if (value.trim() === '') {
          return false;
        }
        const messages = [{ log: Encode({ method: 'command', data: [value] }) }];
        const consoleEvent = [{ method: 'command', data: [value] }];
        dispatchMessage({
          type: MessageTypes.EXECUTE,
          payload: {
            source: 'console',
            messages,
          },
        });
        dispatchConsoleEvent(consoleEvent);
        cm.setValue('');
        setCommandCursor(-1);
        setCommandHistory((prevHistory) => [value, ...prevHistory]);
      } else if (e.key === 'ArrowUp') {
        const lineNumber = cm.getDoc().getCursor().line;
        if (lineNumber !== 0) {
          return false;
        }

        setCommandCursor((prevCursor) => {
          const newCursor = Math.min(
            prevCursor + 1,
            commandHistory.length - 1
          );
          cm.getDoc().setValue(commandHistory[newCursor] || '');
          const cursorPos = cm.getDoc().getLine(0).length - 1;
          cm.getDoc().setCursor({ line: 0, ch: cursorPos });
          return newCursor;
        });
      } else if (e.key === 'ArrowDown') {
        const lineNumber = cm.getDoc().getCursor().line;
        const lineCount = cm.getValue().split('\n').length;
        if (lineNumber + 1 !== lineCount) {
          return false;
        }

        setCommandCursor((prevCursor) => {
          const newCursor = Math.max(prevCursor - 1, -1);
          cm.getDoc().setValue(commandHistory[newCursor] || '');
          const newLineCount = cm.getValue().split('\n').length;
          const newLine = cm.getDoc().getLine(newLineCount);
          const cursorPos = newLine ? newLine.length - 1 : 1;
          cm.getDoc().setCursor({ line: lineCount, ch: cursorPos });
          return newCursor;
        });
      }
      return true;
    };

    codemirrorRef.current.on('keydown', handleKeyDown);
    codemirrorRef.current.getWrapperElement().style[
      'font-size'
    ] = `${fontSize}px`;

    return () => {
      codemirrorRef.current.off('keydown', handleKeyDown);
      codemirrorRef.current = null;
    };
  }, [theme, dispatchConsoleEvent, fontSize]);

  useEffect(() => {
    if (codemirrorRef.current) {
      codemirrorRef.current.setOption('theme', `p5-${theme}`);
      codemirrorRef.current.getWrapperElement().style[
        'font-size'
      ] = `${fontSize}px`;
      codemirrorRef.current.refresh();
    }
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
            height: `${fontSize * 0.57}px`,
          }}
        />
      </div>
      <div
        ref={codemirrorContainerRef}
        className="console__editor"
      />
    </div>
  );
};

ConsoleInput.propTypes = {
  theme: PropTypes.string.isRequired,
  dispatchConsoleEvent: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired,
};

export default ConsoleInput;
