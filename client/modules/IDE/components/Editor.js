import React, { PropTypes } from 'react';
import EditorAccessibility from '../components/EditorAccessibility';
import CodeMirror from 'codemirror';
import beautifyJS from 'js-beautify';
const beautifyCSS = beautifyJS.css;
const beautifyHTML = beautifyJS.html;
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
import InlineSVG from 'react-inlinesvg';
const downArrowUrl = require('../../../images/down-arrow.svg');
import classNames from 'classnames';

import { debounce } from 'throttle-debounce';
import loopProtect from 'loop-protect';

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.tidyCode = this.tidyCode.bind(this);
  }
  componentDidMount() {
    this.beep = new Audio(beepUrl);
    this.widgets = [];
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
        onUpdateLinting: () => {
          debounce(2000, (annotations) => {
            this.props.clearLintMessage();
            annotations.forEach((x) => {
              if (x.from.line > -1) {
                this.props.updateLintMessage(x.severity, (x.from.line + 1), x.message);
              }
            });
            if (this.props.lintMessages.length > 0 && this.props.lintWarning) {
              this.beep.play();
            }
          });
        }
      }
    });
    this._cm.on('change', debounce(200, () => {
      this.props.updateFileContent(this.props.file.name, this._cm.getValue());
      this.checkForInfiniteLoop(debounce(200, (infiniteLoop, prevs) => {
        if (!infiniteLoop && prevs) {
          this.props.startSketch();
        }
      }));
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

    this._cm.on('keydown', (_cm, e) => {
      if (e.key === 'Tab' && e.shiftKey) {
        this.tidyCode();
      }
    });
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

  tidyCode() {
    const beautifyOptions = {
      indent_size: this.props.indentationAmount,
      indent_with_tabs: this.props.isTabIndent
    };

    const mode = this._cm.getOption('mode');
    if (mode === 'javascript') {
      this._cm.doc.setValue(beautifyJS(this._cm.doc.getValue(), beautifyOptions));
    } else if (mode === 'css') {
      this._cm.doc.setValue(beautifyCSS(this._cm.doc.getValue(), beautifyOptions));
    } else if (mode === 'htmlmixed') {
      this._cm.doc.setValue(beautifyHTML(this._cm.doc.getValue(), beautifyOptions));
    }
  }

  checkForInfiniteLoop(callback) {
    const prevIsplaying = this.props.isPlaying;
    let infiniteLoop = false;
    this.props.stopSketch();
    this.props.resetInfiniteLoops();

    for (let i = 0; i < this.widgets.length; ++i) {
      this._cm.removeLineWidget(this.widgets[i]);
    }
    this.widgets.length = 0;
    const OriginalIframe = document.getElementById('OriginalIframe');
    if (OriginalIframe !== null) {
      document.body.removeChild(OriginalIframe);
    }

    loopProtect.alias = 'protect';

    loopProtect.hit = (line) => {
      this.props.detectInfiniteLoops();
      infiniteLoop = true;
      callback(infiniteLoop, prevIsplaying);
      const msg = document.createElement('div');
      const loopError = `line ${line}: This loop is taking too long to run.`;
      msg.appendChild(document.createTextNode(loopError));
      msg.className = 'lint-error';
      this.widgets.push(this._cm.addLineWidget(line - 1, msg, { coverGutter: false, noHScroll: true }));
    };

    const processed = loopProtect(this.props.file.content);

    const iframe = document.createElement('iframe');
    iframe.id = 'OriginalIframe';
    iframe.style.display = 'none';

    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const doc = win.document;
    doc.open();

    win.protect = loopProtect;

    doc.write(`<!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.2/p5.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.2/addons/p5.dom.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.5.2/addons/p5.sound.min.js"></script>
        </head>
        <body>
          <script> 
            ${processed}
          </script>
        </body>
      </html>`);
    doc.close();
    callback(infiniteLoop, prevIsplaying);
  }

  _cm: CodeMirror.Editor

  render() {
    const editorSectionClass = classNames({
      editor: true,
      'editor--options': this.props.editorOptionsVisible
    });

    return (
      <section
        title="code editor"
        role="main"
        className={editorSectionClass}
      >
        <button
          className="editor__options-button"
          tabIndex="0"
          onClick={(e) => {
            e.target.focus();
            this.props.showEditorOptions();
          }}
          onBlur={() => setTimeout(this.props.closeEditorOptions, 200)}
        >
          <InlineSVG src={downArrowUrl} />
        </button>
        <ul className="editor__options">
          <li>
            <a onClick={this.tidyCode}>Tidy</a>
          </li>
          <li>
            <a onClick={this.props.showKeyboardShortcutModal}>Keyboard Shortcuts</a>
          </li>
        </ul>
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
  }),
  editorOptionsVisible: PropTypes.bool.isRequired,
  showEditorOptions: PropTypes.func.isRequired,
  closeEditorOptions: PropTypes.func.isRequired,
  showKeyboardShortcutModal: PropTypes.func.isRequired,
  infiniteLoop: PropTypes.bool.isRequired,
  detectInfiniteLoops: PropTypes.func.isRequired,
  resetInfiniteLoops: PropTypes.func.isRequired,
  stopSketch: PropTypes.func.isRequired,
  startSketch: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired
};

export default Editor;
