import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Encode } from 'console-feed';
import CodeMirror from 'codemirror';
import { useTranslation } from 'react-i18next';
import RightArrowIcon from '../../../images/right-arrow.svg';
import { dispatchMessage, MessageTypes } from '../../../utils/dispatcher';
// eslint-disable-next-line import/first
import 'codemirror/addon/display/placeholder';

const ConsoleInput = ({ theme, dispatchConsoleEvent, fontSize }) => {
  const [commandHistory, setCommandHistory] = useState([]);
  const { t } = useTranslation();
  const codemirrorContainerRef = useRef(null);
  const cmRef = useRef(null);

  useEffect(() => {
    cmRef.current = CodeMirror(codemirrorContainerRef.current, {
      theme: `p5-${theme}`,
      scrollbarStyle: null,
      keymap: 'sublime',
      mode: 'javascript',
      inputStyle: 'contenteditable',
      placeholder: t('Console.Placeholder')
    });

    const handleKeyDown = (cm, e) => {
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
      } else if (e.key === 'ArrowUp') {
        const lineNumber = cm.getDoc().getCursor().line;
        if (lineNumber !== 0) {
          return false;
        }

        setCommandHistory((prevHistory) => {
          const newCursor = Math.min(
            commandHistory.length - 1,
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

        setCommandHistory((prevHistory) => {
          const newCursor = Math.max(prevHistory - 1, -1);
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
    cmRef.current.on('keydown', handleKeyDown);

    cmRef.current.getWrapperElement().style['font-size'] = `${fontSize}px`;

    return () => {
      cmRef.current.off('keydown', handleKeyDown);
      cmRef.current.getWrapperElement().remove();
    };
  }, [theme, t, dispatchConsoleEvent, fontSize]);

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
      <div ref={codemirrorContainerRef} className="console__editor" />
    </div>
  );
};

ConsoleInput.propTypes = {
  theme: PropTypes.string.isRequired,
  dispatchConsoleEvent: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired
};

export default ConsoleInput;
