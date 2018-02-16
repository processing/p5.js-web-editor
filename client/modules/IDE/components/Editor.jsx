import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'codemirror';
import beautifyJS from 'js-beautify';
import 'codemirror/mode/css/css';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/javascript-lint';
import 'codemirror/addon/lint/css-lint';
import 'codemirror/addon/lint/html-lint';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/comment/comment';
import 'codemirror/keymap/sublime';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/match-highlighter';
import 'codemirror/addon/search/jump-to-line';

import { JSHINT } from 'jshint';
import { CSSLint } from 'csslint';
import { HTMLHint } from 'htmlhint';
import InlineSVG from 'react-inlinesvg';
import classNames from 'classnames';
import { debounce } from 'lodash';
import '../../../utils/htmlmixed';
import '../../../utils/p5-javascript';
import Timer from '../components/Timer';
import EditorAccessibility from '../components/EditorAccessibility';
import {
  metaKey,
} from '../../../utils/metaKey';

import search from '../../../utils/codemirror-search';

search(CodeMirror);

const beautifyCSS = beautifyJS.css;
const beautifyHTML = beautifyJS.html;

window.JSHINT = JSHINT;
window.CSSLint = CSSLint;
window.HTMLHint = HTMLHint;

const beepUrl = require('../../../sounds/audioAlert.mp3');
const unsavedChangesDotUrl = require('../../../images/unsaved-changes-dot.svg');
const rightArrowUrl = require('../../../images/right-arrow.svg');
const leftArrowUrl = require('../../../images/left-arrow.svg');

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.tidyCode = this.tidyCode.bind(this);

    this.updateLintingMessageAccessibility = debounce((annotations) => {
      this.props.clearLintMessage();
      annotations.forEach((x) => {
        if (x.from.line > -1) {
          this.props.updateLintMessage(x.severity, (x.from.line + 1), x.message);
        }
      });
      if (this.props.lintMessages.length > 0 && this.props.lintWarning) {
        this.beep.play();
      }
    }, 2000);
    this.showFind = this.showFind.bind(this);
    this.findNext = this.findNext.bind(this);
    this.findPrev = this.findPrev.bind(this);
  }

  componentDidMount() {
    this.beep = new Audio(beepUrl);
    this.widgets = [];
    this._cm = CodeMirror(this.codemirrorContainer, { // eslint-disable-line
      theme: `p5-${this.props.theme}`,
      lineNumbers: true,
      styleActiveLine: true,
      inputStyle: 'contenteditable',
      lineWrapping: false,
      fixedGutter: false,
      foldGutter: true,
      foldOptions: { widget: '\u2026' },
      gutters: ['CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      keyMap: 'sublime',
      highlightSelectionMatches: true, // highlight current search match
      lint: {
        onUpdateLinting: ((annotations) => {
          this.props.hideRuntimeErrorWarning();
          this.updateLintingMessageAccessibility(annotations);
        }),
        options: {
          'asi': true,
          'eqeqeq': false,
          '-W041': false,
          'esversion': 6
        }
      }
    });

    this._cm.setOption('extraKeys', {
      [`${metaKey}-Enter`]: () => null,
      [`Shift-${metaKey}-Enter`]: () => null,
      [`${metaKey}-F`]: 'findPersistent',
      [`${metaKey}-G`]: 'findNext',
      [`Shift-${metaKey}-G`]: 'findPrev',
    });

    this.initializeDocuments(this.props.files);
    this._cm.swapDoc(this._docs[this.props.file.id]);

    this._cm.on('change', debounce(() => {
      this.props.setUnsavedChanges(true);
      this.props.updateFileContent(this.props.file.name, this._cm.getValue());
      if (this.props.autorefresh && this.props.isPlaying) {
        this.props.startRefreshSketch();
        this.props.clearConsole();
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

    this.props.provideController({
      tidyCode: this.tidyCode,
      showFind: this.showFind,
      findNext: this.findNext,
      findPrev: this.findPrev
    });
  }

  componentWillUpdate(nextProps) {
    // check if files have changed
    if (this.props.files[0].id !== nextProps.files[0].id) {
      // then need to make CodeMirror documents
      this.initializeDocuments(nextProps.files);
    }
    if (this.props.files.length !== nextProps.files.length) {
      this.initializeDocuments(nextProps.files);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.file.content !== prevProps.file.content &&
        this.props.file.content !== this._cm.getValue()) {
      const oldDoc = this._cm.swapDoc(this._docs[this.props.file.id]);
      this._docs[prevProps.file.id] = oldDoc;
      this._cm.focus();
      if (!prevProps.unsavedChanges) {
        setTimeout(() => this.props.setUnsavedChanges(false), 400);
      }
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
    if (this.props.theme !== prevProps.theme) {
      this._cm.setOption('theme', `p5-${this.props.theme}`);
    }

    if (prevProps.consoleEvents !== this.props.consoleEvents) {
      this.props.showRuntimeErrorWarning();
    }
    for (let i = 0; i < this._cm.lineCount(); i += 1) {
      this._cm.removeLineClass(i, 'background', 'line-runtime-error');
    }
    if (this.props.runtimeErrorWarningVisible) {
      this.props.consoleEvents.forEach((consoleEvent) => {
        if (consoleEvent.method === 'error') {
          if (consoleEvent.arguments.indexOf(')') > -1) {
            const n = consoleEvent.arguments.replace(')', '').split(' ');
            const lineNumber = parseInt(n[n.length - 1], 10) - 1;
            this._cm.addLineClass(lineNumber, 'background', 'line-runtime-error');
          }
        }
      });
    }
  }

  componentWillUnmount() {
    this._cm = null;
    this.props.provideController(null);
  }

  getFileMode(fileName) {
    let mode;
    if (fileName.match(/.+\.js$/i)) {
      mode = 'javascript';
    } else if (fileName.match(/.+\.css$/i)) {
      mode = 'css';
    } else if (fileName.match(/.+\.html$/i)) {
      mode = 'htmlmixed';
    } else if (fileName.match(/.+\.json$/i)) {
      mode = 'application/json';
    } else {
      mode = 'text/plain';
    }
    return mode;
  }

  initializeDocuments(files) {
    this._docs = {};
    files.forEach((file) => {
      if (file.name !== 'root') {
        this._docs[file.id] = CodeMirror.Doc(file.content, this.getFileMode(file.name)); // eslint-disable-line
      }
    });
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

  showFind() {
    this._cm.execCommand('findPersistent');
  }

  findNext() {
    this._cm.focus();
    this._cm.execCommand('findNext');
  }

  findPrev() {
    this._cm.focus();
    this._cm.execCommand('findPrev');
  }

  toggleEditorOptions() {
    if (this.props.editorOptionsVisible) {
      this.props.closeEditorOptions();
    } else {
      this.optionsButton.focus();
      this.props.showEditorOptions();
    }
  }

  _cm: CodeMirror.Editor

  render() {
    const editorSectionClass = classNames({
      'editor': true,
      'sidebar--contracted': !this.props.isExpanded,
      'editor--options': this.props.editorOptionsVisible
    });

    return (
      <section
        title="code editor"
        role="main"
        className={editorSectionClass}
      >
        <header className="editor__header">
          <button
            aria-label="collapse file navigation"
            className="sidebar__contract"
            onClick={this.props.collapseSidebar}
          >
            <InlineSVG src={leftArrowUrl} />
          </button>
          <button
            aria-label="expand file navigation"
            className="sidebar__expand"
            onClick={this.props.expandSidebar}
          >
            <InlineSVG src={rightArrowUrl} />
          </button>
          <div className="editor__file-name">
            <span>
              {this.props.file.name}
              {this.props.unsavedChanges ? <InlineSVG src={unsavedChangesDotUrl} /> : null}
            </span>
            <Timer
              projectSavedTime={this.props.projectSavedTime}
              isUserOwner={this.props.isUserOwner}
            />
          </div>
        </header>
        <div ref={(element) => { this.codemirrorContainer = element; }} className="editor-holder" tabIndex="0">
        </div>
        <EditorAccessibility
          lintMessages={this.props.lintMessages}
        />
      </section>
    );
  }
}

Editor.propTypes = {
  lintWarning: PropTypes.bool.isRequired,
  lintMessages: PropTypes.arrayOf(PropTypes.shape({
    severity: PropTypes.string.isRequired,
    line: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired
  })).isRequired,
  consoleEvents: PropTypes.arrayOf(PropTypes.shape({
    method: PropTypes.string.isRequired,
    args: PropTypes.arrayOf(PropTypes.string)
  })),
  updateLintMessage: PropTypes.func.isRequired,
  clearLintMessage: PropTypes.func.isRequired,
  indentationAmount: PropTypes.number.isRequired,
  isTabIndent: PropTypes.bool.isRequired,
  updateFileContent: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
  }).isRequired,
  editorOptionsVisible: PropTypes.bool.isRequired,
  showEditorOptions: PropTypes.func.isRequired,
  closeEditorOptions: PropTypes.func.isRequired,
  setUnsavedChanges: PropTypes.func.isRequired,
  startRefreshSketch: PropTypes.func.isRequired,
  autorefresh: PropTypes.bool.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
  unsavedChanges: PropTypes.bool.isRequired,
  projectSavedTime: PropTypes.string.isRequired,
  files: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired
  })).isRequired,
  isExpanded: PropTypes.bool.isRequired,
  collapseSidebar: PropTypes.func.isRequired,
  expandSidebar: PropTypes.func.isRequired,
  isUserOwner: PropTypes.bool,
  clearConsole: PropTypes.func.isRequired,
  showRuntimeErrorWarning: PropTypes.func.isRequired,
  hideRuntimeErrorWarning: PropTypes.func.isRequired,
  runtimeErrorWarningVisible: PropTypes.bool.isRequired,
  provideController: PropTypes.func.isRequired
};

Editor.defaultProps = {
  isUserOwner: false,
  consoleEvents: [],
};

export default Editor;
