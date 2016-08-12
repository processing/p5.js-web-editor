import React, { PropTypes } from 'react';
import EditorAccessibility from '../components/EditorAccessibility';
import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/javascript-lint';
import 'codemirror/addon/lint/css-lint';
import 'codemirror/addon/lint/html-lint';
import 'codemirror/addon/comment/comment';
import 'codemirror/keymap/sublime';
import 'codemirror/addon/search/jump-to-line';
import { JSHINT } from 'jshint';
window.JSHINT = JSHINT;
import { CSSLint } from 'csslint';
window.CSSLint = CSSLint;
import { HTMLHint } from 'htmlhint';
window.HTMLHint = HTMLHint;

import { debounce } from 'throttle-debounce';

class Editor extends React.Component {

  componentDidMount() {
    // TODO: replace with wav file and loader
    this.beep = new Audio('data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU='); // eslint-disable-line
    this._cm = CodeMirror(this.refs.container, { // eslint-disable-line
      theme: 'p5-widget',
      value: this.props.file.content,
      lineNumbers: true,
      styleActiveLine: true,
      inputStyle: 'contenteditable',
      mode: 'javascript',
      lineWrapping: true,
      gutters: ['CodeMirror-lint-markers'],
      keyMap: 'sublime',
      lint: {
        onUpdateLinting: debounce(2000, (annotations) => {
          this.props.clearLintMessage();
          annotations.forEach((x) => {
            if (x.from.line > -1) {
              this.props.updateLintMessage(x.severity, (x.from.line + 1), x.message);
            }
          });
          if (this.props.lintMessages.length > 0 && this.props.lintWarning) {
            this.beep.play();
          }
        })
      }
    });
    this._cm.on('change', debounce(200, () => {
      this.props.updateFileContent(this.props.file.name, this._cm.getValue());
    }));
    this._cm.on('keyup', () => {
      this.props.updateLineNumber(parseInt((this._cm.getCursor().line) + 1, 10));
    });
    // this._cm.on('change', () => { // eslint-disable-line
    //   // this.props.updateFileContent('sketch.js', this._cm.getValue());
    //   throttle(1000, () => console.log('debounce is working!'));
    //   this.props.updateFileContent(this.props.file.name, this._cm.getValue());
    // });
    this._cm.getWrapperElement().style['font-size'] = `${this.props.fontSize}px`;
    this._cm.setOption('indentWithTabs', this.props.isTabIndent);
    this._cm.setOption('tabSize', this.props.indentationAmount);
  }

  componentDidUpdate(prevProps) {
    if (this.props.file.content !== prevProps.file.content &&
        this.props.file.content !== this._cm.getValue()) {
      this._cm.setValue(this.props.file.content); // eslint-disable-line no-underscore-dangle
    }
    if (this.props.fontSize !== prevProps.fontSize) {
      this._cm.getWrapperElement().style['font-size'] = `${this.props.fontSize}px`;
    }
    if (this.props.indentationAmount !== prevProps.indentationAmount) {
      this._cm.setOption('tabSize', this.props.indentationAmount);
    }
    if (this.props.isTabIndent !== prevProps.isTabIndent) {
      this._cm.setOption('indentWithTabs', this.props.isTabIndent);
    }
    if (this.props.file.name !== prevProps.name) {
      if (this.props.file.name.match(/.+\.js$/)) {
        this._cm.setOption('mode', 'javascript');
      } else if (this.props.file.name.match(/.+\.css$/)) {
        this._cm.setOption('mode', 'css');
      } else if (this.props.file.name.match(/.+\.html$/)) {
        this._cm.setOption('mode', 'htmlmixed');
      }
    }
  }

  componentWillUnmount() {
    this._cm = null;
  }

  _cm: CodeMirror.Editor

  render() {
    return (
      <section title="code editor" role="main">
        <div ref="container" className="editor-holder" tabIndex="0">
        </div>
        <EditorAccessibility
          lintMessages={this.props.lintMessages}
          lineNo={this.props.lineNo}
        />
      </section>
    );
  }
}

Editor.propTypes = {
  lintWarning: PropTypes.bool.isRequired,
  lineNo: PropTypes.string.isRequired,
  lintMessages: PropTypes.array.isRequired,
  updateLintMessage: PropTypes.func.isRequired,
  clearLintMessage: PropTypes.func.isRequired,
  updateLineNumber: PropTypes.func.isRequired,
  indentationAmount: PropTypes.number.isRequired,
  isTabIndent: PropTypes.bool.isRequired,
  updateFileContent: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
  })
};

export default Editor;
