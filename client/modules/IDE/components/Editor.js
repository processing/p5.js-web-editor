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

import { debounce } from 'lodash';

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.tidyCode = this.tidyCode.bind(this);
  }
  componentDidMount() {
    this.beep = new Audio(beepUrl);
    this.widgets = [];
    this._cm = CodeMirror(this.refs.container, { // eslint-disable-line
      theme: `p5-${this.props.theme}`,
      value: this.props.file.content,
      lineNumbers: true,
      styleActiveLine: true,
      inputStyle: 'contenteditable',
      mode: 'javascript',
      lineWrapping: false,
      fixedGutter: false,
      gutters: ['CodeMirror-lint-markers'],
      keyMap: 'sublime',
      lint: {
        onUpdateLinting: debounce((annotations) => {
          this.props.clearLintMessage();
          annotations.forEach((x) => {
            if (x.from.line > -1) {
              this.props.updateLintMessage(x.severity, (x.from.line + 1), x.message);
            }
          });
          if (this.props.lintMessages.length > 0 && this.props.lintWarning) {
            this.beep.play();
          }
        }, 2000)
      }
    });

    this._cm.on('change', debounce(() => {
      this.props.setUnsavedChanges(true);
      this.props.updateFileContent(this.props.file.name, this._cm.getValue());
      if (this.props.autorefresh && this.props.isPlaying) {
        this.props.startRefreshSketch();
      }
    }, 400));

    this._cm.on('keyup', () => {
      const temp = `line ${parseInt((this._cm.getCursor().line) + 1, 10)}`;
      document.getElementById('current-line').innerHTML = temp;
    });

    this._cm.on('keydown', (_cm, e) => {
      // 9 === Tab
      if (e.keyCode === 9 && e.shiftKey) {
        this.tidyCode();
      }
    });

    this._cm.getWrapperElement().style['font-size'] = `${this.props.fontSize}px`;
    this._cm.setOption('indentWithTabs', this.props.isTabIndent);
    this._cm.setOption('tabSize', this.props.indentationAmount);
  }

  componentDidUpdate(prevProps) {
    if (this.props.file.content !== prevProps.file.content &&
        this.props.file.content !== this._cm.getValue()) {
      this._cm.setValue(this.props.file.content); // eslint-disable-line no-underscore-dangle
      setTimeout(() => this.props.setUnsavedChanges(false), 500);
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
      if (this.props.file.name.match(/.+\.js$/i)) {
        this._cm.setOption('mode', 'javascript');
      } else if (this.props.file.name.match(/.+\.css$/i)) {
        this._cm.setOption('mode', 'css');
      } else if (this.props.file.name.match(/.+\.html$/i)) {
        this._cm.setOption('mode', 'htmlmixed');
      } else if (this.props.file.name.match(/.+\.json$/i)) {
        this._cm.setOption('mode', 'application/json');
      } else {
        this._cm.setOption('mode', 'text/plain');
      }
    }

    if (this.props.theme !== prevProps.theme) {
      this._cm.setOption('theme', `p5-${this.props.theme}`);
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
          aria-label="editor options"
          tabIndex="0"
          ref="optionsButton"
          onClick={() => {
            this.refs.optionsButton.focus();
            this.props.showEditorOptions();
          }}
          onBlur={() => setTimeout(this.props.closeEditorOptions, 200)}
        >
          <InlineSVG src={downArrowUrl} />
        </button>
        <ul className="editor__options" title="editor options">
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
  setUnsavedChanges: PropTypes.func.isRequired,
  startRefreshSketch: PropTypes.func.isRequired,
  autorefresh: PropTypes.bool.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
};

export default Editor;
