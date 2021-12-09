import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'codemirror';
import { Encode } from 'console-feed';

import RightArrowIcon from '../../../images/right-arrow.svg';
import { dispatchMessage, MessageTypes } from '../../../utils/dispatcher';

// heavily inspired by
// https://github.com/codesandbox/codesandbox-client/blob/92a1131f4ded6f7d9c16945dc7c18aa97c8ada27/packages/app/src/app/components/Preview/DevTools/Console/Input/index.tsx

class ConsoleInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commandHistory: [],
      commandCursor: -1
    };
  }

  componentDidMount() {
    this._cm = CodeMirror(this.codemirrorContainer, {
      // eslint-disable-line
      theme: `p5-${this.props.theme}`,
      scrollbarStyle: null,
      keymap: 'sublime',
      mode: 'javascript',
      inputStyle: 'contenteditable'
    });

    this._cm.on('keydown', (cm, e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const value = cm.getValue();
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
        this.props.dispatchConsoleEvent(consoleEvent);
        cm.setValue('');
        this.setState((state) => ({
          commandCursor: -1,
          commandHistory: [value, ...state.commandHistory]
        }));
      } else if (e.key === 'ArrowUp') {
        const lineNumber = this._cm.getDoc().getCursor().line;
        if (lineNumber !== 0) {
          return false;
        }

        this.setState((state) => {
          const newCursor = Math.min(
            state.commandCursor + 1,
            state.commandHistory.length - 1
          );
          this._cm.getDoc().setValue(state.commandHistory[newCursor] || '');
          const cursorPos = this._cm.getDoc().getLine(0).length - 1;
          this._cm.getDoc().setCursor({ line: 0, ch: cursorPos });
          return { commandCursor: newCursor };
        });
      } else if (e.key === 'ArrowDown') {
        const lineNumber = this._cm.getDoc().getCursor().line;
        const lineCount = this._cm.getValue().split('\n').length;
        if (lineNumber + 1 !== lineCount) {
          return false;
        }

        this.setState((state) => {
          const newCursor = Math.max(state.commandCursor - 1, -1);
          this._cm.getDoc().setValue(state.commandHistory[newCursor] || '');
          const newLineCount = this._cm.getValue().split('\n').length;
          const newLine = this._cm.getDoc().getLine(newLineCount);
          const cursorPos = newLine ? newLine.length - 1 : 1;
          this._cm.getDoc().setCursor({ line: lineCount, ch: cursorPos });
          return { commandCursor: newCursor };
        });
      }
      return true;
    });

    this._cm.getWrapperElement().style[
      'font-size'
    ] = `${this.props.fontSize}px`;
  }

  componentDidUpdate(prevProps) {
    this._cm.setOption('theme', `p5-${this.props.theme}`);
    this._cm.getWrapperElement().style[
      'font-size'
    ] = `${this.props.fontSize}px`;
    this._cm.refresh();
  }

  componentWillUnmount() {
    this._cm = null;
  }

  render() {
    return (
      <div className="console__input">
        <div
          className="console-active__arrow-container"
          style={{ height: `${this.props.fontSize * 1.3333}px` }}
        >
          <RightArrowIcon
            className="console-active__arrow"
            focusable="false"
            aria-hidden="true"
            style={{
              width: `${this.props.fontSize}px`,
              height: `${this.props.fontSize * 0.57}px`
            }}
          />
        </div>
        <div
          ref={(element) => {
            this.codemirrorContainer = element;
          }}
          className="console__editor"
        />
      </div>
    );
  }
}

ConsoleInput.propTypes = {
  theme: PropTypes.string.isRequired,
  dispatchConsoleEvent: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired
};

export default ConsoleInput;
