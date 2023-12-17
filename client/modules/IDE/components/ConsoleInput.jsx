import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import { Encode } from 'console-feed';

import RightArrowIcon from '../../../images/right-arrow.svg';
import { dispatchMessage, MessageTypes } from '../../../utils/dispatcher';

// heavily inspired by
// https://github.com/codesandbox/codesandbox-client/blob/92a1131f4ded6f7d9c16945dc7c18aa97c8ada27/packages/app/src/app/components/Preview/DevTools/Console/Input/index.tsx
const ConsoleInput = (props) => {
  const commandHistory = useRef([]);
  const commandCursor = useRef(-1);

  // refs for codemirror
  const cm = useRef(null);
  // States and refs
  const codemirrorContainer = useRef(null);
  useEffect(() => {
    cm.current = CodeMirror(codemirrorContainer.current, {
      // eslint-disable-line
      theme: `p5-${props.theme}`,
      scrollbarStyle: null,
      keymap: 'sublime',
      mode: 'javascript',
      inputStyle: 'contenteditable'
    });

    cm.current.on('keydown', (cmm, e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const value = cmm.getValue();
        if (value.trim(' ') === '') {
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
        props.dispatchConsoleEvent(consoleEvent);
        cm.current.setValue('');
        commandCursor.current = -1;
        commandHistory.current = [value, ...commandHistory.current];
      } else if (e.key === 'ArrowUp') {
        const lineNumber = cm.current.getDoc().getCursor().line;
        if (lineNumber !== 0) {
          return false;
        }
        const newCursor = Math.min(
          commandCursor.current + 1,
          commandHistory.current.length - 1
        );
        cm.current.getDoc().setValue(commandHistory.current[newCursor] || '');
        const cursorPos = cm.current.getDoc().getLine(0).length - 1;
        cm.current.getDoc().setCursor({ line: 0, ch: cursorPos });
        commandCursor.current = newCursor;
      } else if (e.key === 'ArrowDown') {
        const lineNumber = cm.current.getDoc().getCursor().line;
        const lineCount = cm.current.getValue().split('\n').length;
        if (lineNumber + 1 !== lineCount) {
          return false;
        }
        const newCursor = Math.max(commandCursor.current - 1, -1);
        cm.current.getDoc().setValue(commandHistory.current[newCursor] || '');
        const newLineCount = cm.current.getValue().split('\n').length;
        const newLine = cm.current.getDoc().getLine(newLineCount);
        const cursorPos = newLine ? newLine.length - 1 : 1;
        cm.current.getDoc().setCursor({ line: lineCount, ch: cursorPos });
        commandCursor.current = newCursor;
      }
      return true;
    });

    cm.current.getWrapperElement().style['font-size'] = `${props.fontSize}px`;
    return () => {
      cm.current = null;
    };
  }, []);

  useEffect(() => {
    cm.current.setOption('theme', `p5-${props.theme}`);
    cm.current.getWrapperElement().style['font-size'] = `${props.fontSize}px`;
    cm.current.refresh();
  }, [props.theme, props.fontSize]);

  return (
    <div className="console__input">
      <div
        className="console-active__arrow-container"
        style={{ height: `${props.fontSize * 1.3333}px` }}
      >
        <RightArrowIcon
          className="console-active__arrow"
          focusable="false"
          aria-hidden="true"
          style={{
            width: `${props.fontSize}px`,
            height: `${props.fontSize * 0.57}px`
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
