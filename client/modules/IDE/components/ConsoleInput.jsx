import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'codemirror';
import { Encode } from 'console-feed';

import RightArrowIcon from '../../../images/right-arrow.svg';
import { dispatch } from '../../../utils/dispatcher';

class ConsoleInput extends React.Component {
  componentDidMount() {
    this._cm = CodeMirror(this.codemirrorContainer, { // eslint-disable-line
      theme: `p5-${this.props.theme}`,
      scrollbarStyle: null,
      keymap: 'sublime',
      mode: 'javascript',
      inputStyle: 'contenteditable'
    });

    this._cm.setOption('extraKeys', {
      Up: cm => cm.undo(),
      Down: cm => cm.redo()
    });

    this._cm.setCursor({ line: 1, ch: 5 });

    this._cm.on('keydown', (cm, e) => {
      if (e.keyCode === 13) {
        const value = cm.getValue();
        if (value.trim(' ') === '') {
          return false;
        }
        const messages = [{ log: Encode({ method: 'command', data: [value] }) }];
        const consoleEvent = [{ method: 'command', data: [value] }];
        dispatch({
          source: 'console',
          messages
        });
        this.props.dispatchConsoleEvent(consoleEvent);
        cm.setValue('');
      }
      return true;
    });

    this._cm.on('beforeChange', (cm, changeObj) => {
      const typedNewLine = changeObj.origin === '+input' && changeObj.text.join('') === '';
      if (typedNewLine) {
        return changeObj.cancel();
      }

      const pastedNewLine = changeObj.origin === 'paste' && changeObj.text.length > 1;
      if (pastedNewLine) {
        const newText = changeObj.text.join(' ');
        return changeObj.update(null, null, [newText]);
      }

      return null;
    });

    this._cm.getWrapperElement().style['font-size'] = `${this.props.fontSize}px`;
  }

  componentDidUpdate(prevProps) {
    this._cm.setOption('theme', `p5-${this.props.theme}`);
    this._cm.getWrapperElement().style['font-size'] = `${this.props.fontSize}px`;
    this._cm.refresh();
  }

  componentWillUnmount() {
    this._cm = null;
  }

  // _cm: CodeMirror.Editor

  render() {
    return (
      <div
        className="console__input"
      >
        <div className="console-active__arrow-container">
          <RightArrowIcon
            className="console-active__arrow"
            focusable="false"
            aria-hidden="true"
            style={{ width: `${this.props.fontSize}px` }}
          />
        </div>
        <div ref={(element) => { this.codemirrorContainer = element; }} className="console__editor" />
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
