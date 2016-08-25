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
const beepUrl = require('../../../sounds/audioAlert.mp3');

import { debounce } from 'throttle-debounce';

class Editor extends React.Component {

  componentDidMount() {
    this.beep = new Audio(beepUrl);
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
      const temp = `line ${parseInt((this._cm.getCursor().line) + 1, 10)}`;
      document.getElementById('current-line').innerHTML = temp;
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
          lineNumber={this.props.lineNumber}
        />
      </section>
    );
  }
}

Editor.propTypes = {
  lintWarning: PropTypes.bool.isRequired,
  lineNumber: PropTypes.string.isRequired,
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
