import PropTypes from 'prop-types';
import React from 'react';
import prettier from 'prettier/standalone';
import babelParser from 'prettier/parser-babel';
import htmlParser from 'prettier/parser-html';
import cssParser from 'prettier/parser-postcss';
import { withTranslation } from 'react-i18next';
import StackTrace from 'stacktrace-js';

import { JSHINT } from 'jshint';
import { CSSLint } from 'csslint';
import { HTMLHint } from 'htmlhint';
import classNames from 'classnames';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  keymap,
  lineNumbers,
  lineNumberMarkers,
  EditorView
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import {
  syntaxHighlighting,
  defaultHighlightStyle
} from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { html, htmlCompletionSource } from '@codemirror/lang-html';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { css, cssCompletionSource } from '@codemirror/lang-css';
import { completeFromList, autocompletion } from '@codemirror/autocomplete';
import { Compartment } from '@codemirror/state';

import p5LightCodemirrorTheme, {
  classHighlightStyle
} from '../../CodeMirror/_p5-light-codemirror-theme';

import Timer from '../components/Timer';
import EditorAccessibility from '../components/EditorAccessibility';
import { metaKey } from '../../../utils/metaKey';

import beepUrl from '../../../sounds/audioAlert.mp3';
import UnsavedChangesDotIcon from '../../../images/unsaved-changes-dot.svg';
import RightArrowIcon from '../../../images/right-arrow.svg';
import LeftArrowIcon from '../../../images/left-arrow.svg';
import { getHTMLFile } from '../reducers/files';

import * as FileActions from '../actions/files';
import * as IDEActions from '../actions/ide';
import * as ProjectActions from '../actions/project';
import * as EditorAccessibilityActions from '../actions/editorAccessibility';
import * as PreferencesActions from '../actions/preferences';
import * as UserActions from '../../User/actions';
import * as ToastActions from '../actions/toast';
import * as ConsoleActions from '../actions/console';

import {
  p5FunctionKeywords,
  p5VariableKeywords
} from '../../../utils/p5-keywords';

window.JSHINT = JSHINT;
window.CSSLint = CSSLint;
window.HTMLHint = HTMLHint;

const INDENTATION_AMOUNT = 2;

const p5AutocompleteSource = completeFromList(
  Object.keys(p5FunctionKeywords)
    .map((keyword) => ({
      label: keyword,
      type: 'function',
      boost: 99 // TODO: detail
    }))
    .concat(
      Object.keys(p5VariableKeywords).map((keyword) => ({
        label: keyword,
        type: 'constant',
        boost: 50 // TODO: detail
      }))
    )
);

const p5AutocompleteExt = autocompletion({
  override: [p5AutocompleteSource] // TODO: include native JS
});

console.log('source', p5AutocompleteSource);
console.log('ext', p5AutocompleteExt);
console.log('js', javascript());

const getFileExtension = (fileName) =>
  fileName.match(/\.(\w+)$/)?.[1]?.toLowerCase();

const getLanguageSupport = (fileExtension) => {
  switch (fileExtension) {
    case 'js':
      return javascript({ jsx: false, typescript: false });
    case 'ts':
      return javascript({ jsx: false, typescript: true });
    case 'jsx':
      return javascript({ jsx: true, typescript: false });
    case 'tsx':
      return javascript({ jsx: true, typescript: true });
    case 'css':
      return css();
    case 'html':
      return html(); // Note: has many options
    case 'json':
      return json();
    default:
      return [];
  }
};

/**
 *  @property {CodeMirror} _cm5
 *  @property {EditorView} _cm
 */
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
    // TODO: see
    // https://codesandbox.io/s/codemirror6-vanilla-g78yw?file=/src/editor.js
    // https://discuss.codemirror.net/t/is-there-a-way-to-dynamically-remove-disable-extension/3454/6
    this.language = new Compartment();
    const currentLangExt = getLanguageSupport(
      getFileExtension(this.props.file.name)
    );
    this._cm = new EditorView({
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        this.language.of(currentLangExt),
        syntaxHighlighting(classHighlightStyle),
        p5AutocompleteExt,
        lineNumbers(),
        // TODO: switch
        p5LightCodemirrorTheme
      ],
      parent: this.codemirrorContainer
    });

    const replaceCommand =
      metaKey === 'Ctrl' ? `${metaKey}-H` : `${metaKey}-Option-F`;
    // this._cm5.setOption('extraKeys', {
    const extraKeys = {
      Tab: (cm) => {
        if (!cm.execCommand('emmetExpandAbbreviation')) return;
        // might need to specify and indent more?
        const hasSelection = this._cm.state.selection.ranges.some(
          (r) => !r.empty
        );
        if (hasSelection) {
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
      [replaceCommand]: 'replace',
      // Cassie Tarakajian: If you don't set a default color, then when you
      // choose a color, it deletes characters inline. This is a
      // hack to prevent that.
      [`${metaKey}-K`]: (cm, event) =>
        cm.state.colorpicker.popup_color_picker({ length: 0 }),
      [`${metaKey}-.`]: 'toggleComment' // Note: most adblockers use the shortcut ctrl+.
    };
    // });

    this.replaceFileContent(this.props.file.content);

    const eFacet = EditorView.updateListener;
    /**
     * @param {ViewUpdate} update
     */
    const onViewUpdate = (update) => {};
    // TODO
    /* this._cm5.on(
      'change',
      debounce(() => {
        this.props.setUnsavedChanges(true);
        this.props.hideRuntimeErrorWarning();
        this.props.updateFileContent(
          this.props.file.id,
          this._cm.state.doc.toString()
        );
        if (this.props.autorefresh && this.props.isPlaying) {
          this.props.clearConsole();
          this.props.startSketch();
        }
      }, 1000)
    );
     */

    /*
    this._cm5.on('keyup', () => {
      const temp = this.props.t('Editor.KeyUpLineNumber', {
        lineNumber: this._cm.doc.lineAt(this._cm.state.selection.main.head)
          .number
      });
      document.getElementById('current-line').innerHTML = temp;
    });
*/
    /*
    this._cm5.on('keydown', (_cm, e) => {
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
*/

    this._cm.dom.style['font-size'] = `${this.props.fontSize}px`;

    this.props.provideController({
      tidyCode: this.tidyCode,
      showFind: this.showFind,
      showReplace: this.showReplace,
      getContent: this.getContent
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.file.content !== prevProps.file.content) {
      this.replaceFileContent(this.props.file.content);
      this._cm.focus();

      if (!prevProps.unsavedChanges) {
        setTimeout(() => this.props.setUnsavedChanges(false), 400);
      }
    }
    if (this.props.file.name !== prevProps.file.name) {
      this._cm.dispatch({
        effects: this.language.reconfigure(
          getLanguageSupport(getFileExtension(this.props.file.name))
        )
      });
    }
    if (this.props.fontSize !== prevProps.fontSize) {
      this._cm.dom.style['font-size'] = `${this.props.fontSize}px`;
    }
    if (this.props.linewrap !== prevProps.linewrap) {
      // this._cm5.setOption('lineWrapping', this.props.linewrap);
    }
    if (this.props.theme !== prevProps.theme) {
      // this._cm5.setOption('theme', `p5-${this.props.theme}`);
    }
    if (this.props.lineNumbers !== prevProps.lineNumbers) {
      // this._cm5.setOption('lineNumbers', this.props.lineNumbers);
    }
    if (
      this.props.autocloseBracketsQuotes !== prevProps.autocloseBracketsQuotes
    ) {
      /* this._cm5.setOption(
        'autoCloseBrackets',
        this.props.autocloseBracketsQuotes
      ); */
    }

    if (this.props.runtimeErrorWarningVisible) {
      if (this.props.consoleEvents.length !== prevProps.consoleEvents.length) {
        this.props.consoleEvents.forEach((consoleEvent) => {
          if (consoleEvent.method === 'error') {
            // It doesn't work if you create a new Error, but this works
            // LOL
            const errorObj = { stack: consoleEvent.data[0].toString() };
            StackTrace.fromError(errorObj).then((stackLines) => {
              this.props.expandConsole();
              const line = stackLines.find(
                (l) => l.fileName && l.fileName.startsWith('/')
              );
              if (!line) return;
              const fileNameArray = line.fileName.split('/');
              const fileName = fileNameArray.slice(-1)[0];
              const filePath = fileNameArray.slice(0, -1).join('/');
              const fileWithError = this.props.files.find(
                (f) => f.name === fileName && f.filePath === filePath
              );
              this.props.setSelectedFile(fileWithError.id);
              // TODO: instead of addLineClass, use line decorations:
              // https://codemirror.net/examples/zebra/
              // https://discuss.codemirror.net/t/how-to-add-line-class-to-a-specific-line-dynamically/6230
              // https://discuss.codemirror.net/t/equivalent-for-addlineclass-in-cm6/4356
              // https://discuss.codemirror.net/t/how-to-add-classes-to-lines/3039/3
              /* this._cm5.addLineClass(
                line.lineNumber - 1,
                'background',
                'line-runtime-error'
              ); */
            });
          }
        });
      } else {
        for (let i = 0; i < this._cm.state.doc.lines; i += 1) {
          // this._cm5.removeLineClass(i, 'background', 'line-runtime-error');
        }
      }
    }

    if (this.props.file.id !== prevProps.file.id) {
      for (let i = 0; i < this._cm.state.doc.lines; i += 1) {
        // this._cm5.removeLineClass(i, 'background', 'line-runtime-error');
      }
    }
  }

  componentWillUnmount() {
    this._cm5 = null;
    this._cm.destroy();
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
    } else if (fileName.match(/.+\.(frag|glsl)$/i)) {
      mode = 'x-shader/x-fragment';
    } else if (fileName.match(/.+\.(vert|stl)$/i)) {
      mode = 'x-shader/x-vertex';
    } else {
      mode = 'text/plain';
    }
    return mode;
  }

  getContent() {
    return {
      ...this.props.file,
      content: this._cm.state.doc.toString()
    };
  }

  showFind() {
    // this._cm5.execCommand('findPersistent');
  }

  showReplace() {
    // this._cm5.execCommand('replace');
  }

  prettierFormatWithCursor(parser, plugins) {
    try {
      const { formatted, cursorOffset } = prettier.formatWithCursor(
        this._cm.state.doc.toString(),
        {
          cursorOffset: this._cm.state.selection.main.head,
          parser,
          plugins
        }
      );
      // const { left, top } = this._cm5.getScrollInfo();
      this.replaceFileContent(formatted); // TODO: make sure this syncs to redux
      this._cm.focus();
      this._cm.dispatch({
        selection: { anchor: cursorOffset }
      });
      // this._cm5.scrollTo(left, top);
    } catch (error) {
      console.error(error);
    }
  }

  tidyCode() {
    const x = this._cm.state;
    console.log(x);
    // const mode = this._cm5.getOption('mode');
    const mode = this.getFileMode(this.props.file.name);
    if (mode === 'javascript') {
      this.prettierFormatWithCursor('babel', [babelParser]);
    } else if (mode === 'css') {
      this.prettierFormatWithCursor('css', [cssParser]);
    } else if (mode === 'htmlmixed') {
      this.prettierFormatWithCursor('html', [htmlParser]);
    }
    // TODO: remove this, for dev only
    else {
      console.log(`No formatter for file type ${mode}`, this.props.file);
    }
  }

  replaceFileContent(content) {
    this._cm.dispatch({
      changes: { from: 0, to: this._cm.state.doc.length, insert: content }
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
            <Timer />
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
  // updateFileContent: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    url: PropTypes.string
  }).isRequired,
  setUnsavedChanges: PropTypes.func.isRequired,
  // startSketch: PropTypes.func.isRequired,
  // autorefresh: PropTypes.bool.isRequired,
  // isPlaying: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
  unsavedChanges: PropTypes.bool.isRequired,
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
  // clearConsole: PropTypes.func.isRequired,
  // showRuntimeErrorWarning: PropTypes.func.isRequired,
  // hideRuntimeErrorWarning: PropTypes.func.isRequired,
  runtimeErrorWarningVisible: PropTypes.bool.isRequired,
  provideController: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  setSelectedFile: PropTypes.func.isRequired,
  expandConsole: PropTypes.func.isRequired
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
    isExpanded: state.ide.sidebarIsExpanded
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
