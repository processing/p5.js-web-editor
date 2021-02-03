import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'codemirror';
import beautifyJS from 'js-beautify';
import { withTranslation } from 'react-i18next';
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
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/selection/mark-selection';

import { JSHINT } from 'jshint';
import { CSSLint } from 'csslint';
import { HTMLHint } from 'htmlhint';
import classNames from 'classnames';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import '../../../utils/htmlmixed';
import '../../../utils/p5-javascript';
import '../../../utils/webGL-clike';
import Timer from '../components/Timer';
import EditorAccessibility from '../components/EditorAccessibility';
import { metaKey } from '../../../utils/metaKey';

import '../../../utils/codemirror-search';

import beepUrl from '../../../sounds/audioAlert.mp3';
import UnsavedChangesDotIcon from '../../../images/unsaved-changes-dot.svg';
import RightArrowIcon from '../../../images/right-arrow.svg';
import LeftArrowIcon from '../../../images/left-arrow.svg';
import { getHTMLFile } from '../reducers/files';
import { getIsUserOwner } from '../selectors/users';

import * as FileActions from '../actions/files';
import * as IDEActions from '../actions/ide';
import * as ProjectActions from '../actions/project';
import * as EditorAccessibilityActions from '../actions/editorAccessibility';
import * as PreferencesActions from '../actions/preferences';
import * as UserActions from '../../User/actions';
import * as ToastActions from '../actions/toast';
import * as ConsoleActions from '../actions/console';

const beautifyCSS = beautifyJS.css;
const beautifyHTML = beautifyJS.html;

window.JSHINT = JSHINT;
window.CSSLint = CSSLint;
window.HTMLHint = HTMLHint;

const IS_TAB_INDENT = false;
const INDENTATION_AMOUNT = 2;

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.tidyCode = this.tidyCode.bind(this);

    this.updateLintingMessageAccessibility = debounce((annotations) => {
      this.props.clearLintMessage();
      annotations.forEach((x) => {
        if (x.from.line > -1) {
          this.props.updateLintMessage(x.severity, x.from.line + 1, x.message);
        }
      });
      if (this.props.lintMessages.length > 0 && this.props.lintWarning) {
        this.beep.play();
      }
    }, 2000);
    this.showFind = this.showFind.bind(this);
    this.findNext = this.findNext.bind(this);
    this.findPrev = this.findPrev.bind(this);
    this.showReplace = this.showReplace.bind(this);
    this.getContent = this.getContent.bind(this);
  }

  componentDidMount() {
    this.beep = new Audio(beepUrl);
    this.widgets = [];
    this._cm = CodeMirror(this.codemirrorContainer, {
      // eslint-disable-line
      theme: `p5-${this.props.theme}`,
      lineNumbers: this.props.lineNumbers,
      styleActiveLine: true,
      inputStyle: 'contenteditable',
      lineWrapping: this.props.linewrap,
      fixedGutter: false,
      foldGutter: true,
      foldOptions: { widget: '\u2026' },
      gutters: ['CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      keyMap: 'sublime',
      highlightSelectionMatches: true, // highlight current search match
      matchBrackets: true,
      autoCloseBrackets: this.props.autocloseBracketsQuotes,
      styleSelectedText: true,
      lint: {
        onUpdateLinting: (annotations) => {
          this.props.hideRuntimeErrorWarning();
          this.updateLintingMessageAccessibility(annotations);
        },
        options: {
          asi: true,
          eqeqeq: false,
          '-W041': false,
          esversion: 7
        }
      }
    });

    delete this._cm.options.lint.options.errors;

    const replaceCommand =
      metaKey === 'Ctrl' ? `${metaKey}-H` : `${metaKey}-Option-F`;
    this._cm.setOption('extraKeys', {
      Tab: (cm) => {
        // might need to specify and indent more?
        const selection = cm.doc.getSelection();
        if (selection.length > 0) {
          cm.execCommand('indentMore');
        } else {
          cm.replaceSelection(' '.repeat(INDENTATION_AMOUNT));
        }
      },
      [`${metaKey}-Enter`]: () => null,
      [`Shift-${metaKey}-Enter`]: () => null,
      [`${metaKey}-F`]: 'findPersistent',
      [`${metaKey}-G`]: 'findNext',
      [`Shift-${metaKey}-G`]: 'findPrev',
      [replaceCommand]: 'replace'
    });

    this.initializeDocuments(this.props.files);
    this._cm.swapDoc(this._docs[this.props.file.id]);

    this._cm.on(
      'change',
      debounce(() => {
        this.props.setUnsavedChanges(true);
        this.props.updateFileContent(this.props.file.id, this._cm.getValue());
        if (this.props.autorefresh && this.props.isPlaying) {
          this.props.clearConsole();
          this.props.startRefreshSketch();
        }
      }, 1000)
    );

    this._cm.on('keyup', () => {
      const temp = this.props.t('Editor.KeyUpLineNumber', {
        lineNumber: parseInt(this._cm.getCursor().line + 1, 10)
      });
      document.getElementById('current-line').innerHTML = temp;
    });

    this._cm.on('keydown', (_cm, e) => {
      // 70 === f
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.keyCode === 70) {
        e.preventDefault();
        this.tidyCode();
      }
    });

    this._cm.getWrapperElement().style[
      'font-size'
    ] = `${this.props.fontSize}px`;

    this.props.provideController({
      tidyCode: this.tidyCode,
      showFind: this.showFind,
      findNext: this.findNext,
      findPrev: this.findPrev,
      showReplace: this.showReplace,
      getContent: this.getContent
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
    if (
      this.props.file.content !== prevProps.file.content &&
      this.props.file.content !== this._cm.getValue()
    ) {
      const oldDoc = this._cm.swapDoc(this._docs[this.props.file.id]);
      this._docs[prevProps.file.id] = oldDoc;
      this._cm.focus();
      if (!prevProps.unsavedChanges) {
        setTimeout(() => this.props.setUnsavedChanges(false), 400);
      }
    }
    if (this.props.fontSize !== prevProps.fontSize) {
      this._cm.getWrapperElement().style[
        'font-size'
      ] = `${this.props.fontSize}px`;
    }
    if (this.props.linewrap !== prevProps.linewrap) {
      this._cm.setOption('lineWrapping', this.props.linewrap);
    }
    if (this.props.theme !== prevProps.theme) {
      this._cm.setOption('theme', `p5-${this.props.theme}`);
    }
    if (this.props.lineNumbers !== prevProps.lineNumbers) {
      this._cm.setOption('lineNumbers', this.props.lineNumbers);
    }
    if (
      this.props.autocloseBracketsQuotes !== prevProps.autocloseBracketsQuotes
    ) {
      this._cm.setOption(
        'autoCloseBrackets',
        this.props.autocloseBracketsQuotes
      );
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
          if (
            consoleEvent.data &&
            consoleEvent.data[0] &&
            consoleEvent.data[0].indexOf &&
            consoleEvent.data[0].indexOf(')') > -1
          ) {
            const n = consoleEvent.data[0].replace(')', '').split(' ');
            const lineNumber = parseInt(n[n.length - 1], 10) - 1;
            const { source } = consoleEvent;
            const fileName = this.props.file.name;
            const errorFromJavaScriptFile = `${source}.js` === fileName;
            const errorFromIndexHTML =
              source === fileName && fileName === 'index.html';
            if (
              !Number.isNaN(lineNumber) &&
              (errorFromJavaScriptFile || errorFromIndexHTML)
            ) {
              this._cm.addLineClass(
                lineNumber,
                'background',
                'line-runtime-error'
              );
            }
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
    } else if (fileName.match(/.+\.(frag|vert)$/i)) {
      mode = 'clike';
    } else {
      mode = 'text/plain';
    }
    return mode;
  }

  getContent() {
    const content = this._cm.getValue();
    const updatedFile = Object.assign({}, this.props.file, { content });
    return updatedFile;
  }

  findPrev() {
    this._cm.focus();
    this._cm.execCommand('findPrev');
  }

  findNext() {
    this._cm.focus();
    this._cm.execCommand('findNext');
  }

  showFind() {
    this._cm.execCommand('findPersistent');
  }

  showReplace() {
    this._cm.execCommand('replace');
  }

  tidyCode() {
    const beautifyOptions = {
      indent_size: INDENTATION_AMOUNT,
      indent_with_tabs: IS_TAB_INDENT
    };
    const mode = this._cm.getOption('mode');
    const currentPosition = this._cm.doc.getCursor();
    if (mode === 'javascript') {
      this._cm.doc.setValue(
        beautifyJS(this._cm.doc.getValue(), beautifyOptions)
      );
    } else if (mode === 'css') {
      this._cm.doc.setValue(
        beautifyCSS(this._cm.doc.getValue(), beautifyOptions)
      );
    } else if (mode === 'htmlmixed') {
      this._cm.doc.setValue(
        beautifyHTML(this._cm.doc.getValue(), beautifyOptions)
      );
    }
    this._cm.focus();
    this._cm.doc.setCursor({
      line: currentPosition.line,
      ch: currentPosition.ch + INDENTATION_AMOUNT
    });
  }

  initializeDocuments(files) {
    this._docs = {};
    files.forEach((file) => {
      if (file.name !== 'root') {
        this._docs[file.id] = CodeMirror.Doc(
          file.content,
          this.getFileMode(file.name)
        ); // eslint-disable-line
      }
    });
  }

  toggleEditorOptions() {
    if (this.props.editorOptionsVisible) {
      this.props.closeEditorOptions();
    } else {
      this.optionsButton.focus();
      this.props.showEditorOptions();
    }
  }

  render() {
    const editorSectionClass = classNames({
      editor: true,
      'sidebar--contracted': !this.props.isExpanded,
      'editor--options': this.props.editorOptionsVisible
    });

    const editorHolderClass = classNames({
      'editor-holder': true,
      'editor-holder--hidden':
        this.props.file.fileType === 'folder' || this.props.file.url
    });

    return (
      <section className={editorSectionClass}>
        <header className="editor__header">
          <button
            aria-label={this.props.t('Editor.OpenSketchARIA')}
            className="sidebar__contract"
            onClick={this.props.collapseSidebar}
          >
            <LeftArrowIcon focusable="false" aria-hidden="true" />
          </button>
          <button
            aria-label={this.props.t('Editor.CloseSketchARIA')}
            className="sidebar__expand"
            onClick={this.props.expandSidebar}
          >
            <RightArrowIcon focusable="false" aria-hidden="true" />
          </button>
          <div className="editor__file-name">
            <span>
              {this.props.file.name}
              <span className="editor__unsaved-changes">
                {this.props.unsavedChanges ? (
                  <UnsavedChangesDotIcon
                    role="img"
                    aria-label={this.props.t('Editor.UnsavedChangesARIA')}
                    focusable="false"
                  />
                ) : null}
              </span>
            </span>
            <Timer
              projectSavedTime={this.props.projectSavedTime}
              isUserOwner={this.props.isUserOwner}
            />
          </div>
        </header>
        <article
          ref={(element) => {
            this.codemirrorContainer = element;
          }}
          className={editorHolderClass}
        />
        <EditorAccessibility lintMessages={this.props.lintMessages} />
      </section>
    );
  }
}

Editor.propTypes = {
  autocloseBracketsQuotes: PropTypes.bool.isRequired,
  lineNumbers: PropTypes.bool.isRequired,
  lintWarning: PropTypes.bool.isRequired,
  linewrap: PropTypes.bool.isRequired,
  lintMessages: PropTypes.arrayOf(
    PropTypes.shape({
      severity: PropTypes.string.isRequired,
      line: PropTypes.number.isRequired,
      message: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired
    })
  ).isRequired,
  consoleEvents: PropTypes.arrayOf(
    PropTypes.shape({
      method: PropTypes.string.isRequired,
      args: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  updateLintMessage: PropTypes.func.isRequired,
  clearLintMessage: PropTypes.func.isRequired,
  updateFileContent: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    url: PropTypes.string
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
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired
    })
  ).isRequired,
  isExpanded: PropTypes.bool.isRequired,
  collapseSidebar: PropTypes.func.isRequired,
  expandSidebar: PropTypes.func.isRequired,
  isUserOwner: PropTypes.bool.isRequired,
  clearConsole: PropTypes.func.isRequired,
  showRuntimeErrorWarning: PropTypes.func.isRequired,
  hideRuntimeErrorWarning: PropTypes.func.isRequired,
  runtimeErrorWarningVisible: PropTypes.bool.isRequired,
  provideController: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

Editor.defaultProps = {
  consoleEvents: []
};

function mapStateToProps(state) {
  return {
    files: state.files,
    file:
      state.files.find((file) => file.isSelectedFile) ||
      state.files.find((file) => file.name === 'sketch.js') ||
      state.files.find((file) => file.name !== 'root'),
    htmlFile: getHTMLFile(state.files),
    ide: state.ide,
    preferences: state.preferences,
    editorAccessibility: state.editorAccessibility,
    user: state.user,
    project: state.project,
    toast: state.toast,
    console: state.console,

    ...state.preferences,
    ...state.ide,
    ...state.project,
    ...state.editorAccessibility,
    isExpanded: state.ide.sidebarIsExpanded,
    projectSavedTime: state.project.updatedAt,
    isUserOwner: getIsUserOwner(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    Object.assign(
      {},
      EditorAccessibilityActions,
      FileActions,
      ProjectActions,
      IDEActions,
      PreferencesActions,
      UserActions,
      ToastActions,
      ConsoleActions
    ),
    dispatch
  );
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(Editor)
);
