import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'codemirror';
import emmet from '@emmetio/codemirror-plugin';
import prettier from 'prettier';
import babelParser from 'prettier/parser-babel';
import htmlParser from 'prettier/parser-html';
import cssParser from 'prettier/parser-postcss';
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

emmet(CodeMirror);

window.JSHINT = JSHINT;
window.CSSLint = CSSLint;
window.HTMLHint = HTMLHint;

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
      emmet: {
        preview: ['html'],
        markTagPairs: true,
        autoRenameTags: true
      },
      autoCloseBrackets: this.props.autocloseBracketsQuotes,
      styleSelectedText: true,
      lint: {
        onUpdateLinting: (annotations) => {
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
        if (!cm.execCommand('emmetExpandAbbreviation')) return;
        // might need to specify and indent more?
        const selection = cm.doc.getSelection();
        if (selection.length > 0) {
          cm.execCommand('indentMore');
        } else {
          cm.replaceSelection(' '.repeat(INDENTATION_AMOUNT));
        }
      },
      Enter: 'emmetInsertLineBreak',
      Esc: 'emmetResetAbbreviation',
      [`${metaKey}-Enter`]: () => null,
      [`Shift-${metaKey}-Enter`]: () => null,
      [`${metaKey}-F`]: 'findPersistent',
      [`${metaKey}-G`]: 'findPersistentNext',
      [`Shift-${metaKey}-G`]: 'findPersistentPrev',
      [replaceCommand]: 'replace'
    });

    this.initializeDocuments(this.props.files);
    this._cm.swapDoc(this._docs[this.props.file.id]);

    this._cm.on(
      'change',
      debounce(() => {
        this.props.setUnsavedChanges(true);
        this.props.hideRuntimeErrorWarning();
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
      if (
        ((metaKey === 'Cmd' && e.metaKey) ||
          (metaKey === 'Ctrl' && e.ctrlKey)) &&
        e.shiftKey &&
        e.keyCode === 70
      ) {
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

    if (this.props.runtimeErrorWarningVisible) {
      this.props.consoleEvents.forEach((consoleEvent) => {
        if (consoleEvent.method === 'error') {
          if (
            consoleEvent.data &&
            consoleEvent.data[0] &&
            consoleEvent.data[0].indexOf &&
            consoleEvent.data[0].indexOf(')') > -1
          ) {
            const sourceAndLoc = consoleEvent.data[0]
              .split('\n')[1]
              .split('(')[1]
              .split(')')[0];
            const [source, line, column] = sourceAndLoc.split(':');
            const lineNumber = parseInt(line, 10) - 1;
            this._cm.addLineClass(
              lineNumber,
              'background',
              'line-runtime-error'
            );
          }
        }
      });
    } else {
      for (let i = 0; i < this._cm.lineCount(); i += 1) {
        this._cm.removeLineClass(i, 'background', 'line-runtime-error');
      }
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
    } else if (fileName.match(/.+\.(html|xml)$/i)) {
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

  showFind() {
    this._cm.execCommand('findPersistent');
  }

  showReplace() {
    this._cm.execCommand('replace');
  }

  prettierFormatWithCursor(parser, plugins) {
    try {
      const { formatted, cursorOffset } = prettier.formatWithCursor(
        this._cm.doc.getValue(),
        {
          cursorOffset: this._cm.doc.indexFromPos(this._cm.doc.getCursor()),
          parser,
          plugins
        }
      );
      this._cm.doc.setValue(formatted);
      this._cm.focus();
      this._cm.doc.setCursor(this._cm.doc.posFromIndex(cursorOffset));
    } catch (error) {
      console.error(error);
    }
  }

  tidyCode() {
    const mode = this._cm.getOption('mode');
    if (mode === 'javascript') {
      this.prettierFormatWithCursor('babel', [babelParser]);
    } else if (mode === 'css') {
      this.prettierFormatWithCursor('css', [cssParser]);
    } else if (mode === 'htmlmixed') {
      this.prettierFormatWithCursor('html', [htmlParser]);
    }
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

  render() {
    const editorSectionClass = classNames({
      editor: true,
      'sidebar--contracted': !this.props.isExpanded
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
  ).isRequired,
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
  // showRuntimeErrorWarning: PropTypes.func.isRequired,
  hideRuntimeErrorWarning: PropTypes.func.isRequired,
  runtimeErrorWarningVisible: PropTypes.bool.isRequired,
  provideController: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
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
    consoleEvents: state.console,

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
