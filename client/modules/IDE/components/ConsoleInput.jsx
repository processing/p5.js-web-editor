import { defaultKeymap, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting } from '@codemirror/language';
import { classHighlighter } from '@lezer/highlight';
import React, { useRef, useState, useEffect } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { Encode } from 'console-feed';
import { javascript } from '@codemirror/lang-javascript';
import { useDispatch, useSelector } from 'react-redux';

import RightArrowIcon from '../../../images/right-arrow.svg';
import { dispatchMessage, MessageTypes } from '../../../utils/dispatcher';
import { replaceContent, cursorLineNumber } from '../../CodeMirror/util';
import CoreStyled from '../../CodeMirror/CoreStyled';
import { dispatchConsoleEvent } from '../actions/console';

// heavily inspired by
// https://github.com/codesandbox/codesandbox-client/blob/92a1131f4ded6f7d9c16945dc7c18aa97c8ada27/packages/app/src/app/components/Preview/DevTools/Console/Input/index.tsx

// TODO: Tab causes loss of focus
// TODO: remove margin at top

/**
 *  @property {CodeMirror} _cm5
 *  @property {EditorView} _cm
 */

/*
   this._cm5 = CodeMirror(this.codemirrorContainer, {
     // eslint-disable-line
     theme: `p5-${this.props.theme}`,
     scrollbarStyle: null,
     keymap: 'sublime',
     mode: 'javascript',
     inputStyle: 'contenteditable'
   });
*/

function ConsoleInput() {
  const dispatch = useDispatch();

  const fontSize = useSelector((state) => state.preferences.fontSize);

  const [state, setState] = useState({
    commandHistory: [],
    commandCursor: -1
  });

  const containerRef = useRef(null);

  useEffect(() => {
    const cm6 = new EditorView({
      extensions: [
        javascript(),
        syntaxHighlighting(classHighlighter),
        keymap.of([
          {
            key: 'Enter',
            run: (view, e) => {
              console.log(e);
              // e.preventDefault();
              // e.stopPropagation();
              const value = view.state.doc.toString();
              if (value.trim() === '') {
                return false;
              }
              const consoleEvent = { method: 'command', data: [value] };
              dispatchMessage({
                type: MessageTypes.EXECUTE,
                payload: {
                  source: 'console',
                  messages: [{ log: Encode(consoleEvent) }]
                }
              });
              dispatch(dispatchConsoleEvent([consoleEvent]));
              replaceContent(view, '');
              setState((prevState) => ({
                commandCursor: -1,
                commandHistory: [value, ...prevState.commandHistory]
              }));
              return true;
            },
            shift: () => false
          },
          {
            key: 'ArrowUp',
            run: (view) => {
              console.log('ArrowUp handler');
              const lineNumber = cursorLineNumber(view);
              console.log(lineNumber);
              if (lineNumber !== 1) {
                return false;
              }
              setState((prevState) => {
                const newCursor = Math.min(
                  prevState.commandCursor + 1,
                  prevState.commandHistory.length - 1
                );
                replaceContent(view, prevState.commandHistory[newCursor] || '');
                const cursorPos = view.state.doc.lineAt(1).length - 1;
                view.dispatch({ selection: { anchor: cursorPos } });
                return { ...prevState, commandCursor: newCursor };
              });
              return true;
            }
          },
          {
            key: 'ArrowDown',
            run: (view) => {
              console.log('ArrowDown handler');
              const lineNumber = cursorLineNumber(view);
              const lineCount = view.state.doc.lines;
              if (lineNumber !== lineCount) {
                return false;
              }
              setState((prevState) => {
                const newCursor = Math.max(prevState.commandCursor - 1, -1);
                replaceContent(view, prevState.commandHistory[newCursor] || '');
                const newLineCount = view.state.doc.lines;
                const newLine = view.state.doc.line(newLineCount);
                view.dispatch({ selection: { anchor: newLine.to } });
                return { ...prevState, commandCursor: newCursor };
              });
              return true;
            }
          },
          ...defaultKeymap
        ])
        // history?
        // theme?
      ],
      parent: containerRef.current
    });
    return () => cm6.destroy();
  }, [containerRef, setState, dispatch]);

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
      <CoreStyled ref={containerRef} className="console__editor" />
    </div>
  );
}

export default ConsoleInput;
