import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import { Encode } from 'console-feed';
import RightArrowIcon from '../../../images/right-arrow.svg';
import { dispatchMessage, MessageTypes } from '../../../utils/dispatcher';

const ConsoleInput = ({ theme, dispatchConsoleEvent, fontSize }) => {
  const [commandHistory, setCommandHistory] = useState([]);
  const [commandCursor, setCommandCursor] = useState(-1);
  const codemirrorContainer = useRef(null);
  const cmInstance = useRef(null);

  useEffect(() => {
    cmInstance.current = CodeMirror(codemirrorContainer.current, {
      theme: `p5-${theme}`,
      scrollbarStyle: null,
      keymap: 'sublime',
      mode: 'javascript',
      inputStyle: 'contenteditable'
    });

    cmInstance.current.on('keydown', (cm, e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const value = cm.getValue();
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
        cm.setValue('');
        setCommandHistory((prevHistory) => [value, ...prevHistory]);
        setCommandCursor(-1);
      } else if (e.key === 'ArrowUp') {
        const lineNumber = cmInstance.current.getDoc().getCursor().line;
        if (lineNumber !== 0) {
          return false;
        }

        setCommandCursor((prevCursor) => {
          const newCursor = Math.min(prevCursor + 1, commandHistory.length - 1);
          cmInstance.current.getDoc().setValue(commandHistory[newCursor] || '');
          const cursorPos = cmInstance.current.getDoc().getLine(0).length - 1;
          cmInstance.current.getDoc().setCursor({ line: 0, ch: cursorPos });
          return newCursor;
        });
      } else if (e.key === 'ArrowDown') {
        const lineNumber = cmInstance.current.getDoc().getCursor().line;
        const lineCount = cmInstance.current.getValue().split('\n').length;
        if (lineNumber + 1 !== lineCount) {
          return false;
        }

        setCommandCursor((prevCursor) => {
          const newCursor = Math.max(prevCursor - 1, -1);
          cmInstance.current.getDoc().setValue(commandHistory[newCursor] || '');
          const newLineCount = cmInstance.current.getValue().split('\n').length;
          const newLine = cmInstance.current.getDoc().getLine(newLineCount);
          const cursorPos = newLine ? newLine.length - 1 : 1;
          cmInstance.current
            .getDoc()
            .setCursor({ line: lineCount, ch: cursorPos });
          return newCursor;
        });
      }
      return true;
    });

    cmInstance.current.getWrapperElement().style['font-size'] = `${fontSize}px`;

    return () => {
      cmInstance.current = null; // Cleanup when the component unmounts
    };
  }, [theme, dispatchConsoleEvent, fontSize, commandHistory]);

  useEffect(() => {
    if (cmInstance.current) {
      cmInstance.current.setOption('theme', `p5-${theme}`);
      cmInstance.current.getWrapperElement().style[
        'font-size'
      ] = `${fontSize}px`;
      cmInstance.current.refresh();
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
            height: `${fontSize * 0.57}px`
          }}
        />
      </div>
      <div ref={codemirrorContainer} className="console__editor" />
    </div>
  );
};

ConsoleInput.propTypes = {
  theme: PropTypes.string.isRequired,
  dispatchConsoleEvent: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired
};

export default ConsoleInput;
