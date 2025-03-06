// TODO: convert to functional component

import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'codemirror';
import Fuse from 'fuse.js';
import emmet from '@emmetio/codemirror-plugin';
import prettier from 'prettier/standalone';
import babelParser from 'prettier/parser-babel';
import htmlParser from 'prettier/parser-html';
import cssParser from 'prettier/parser-postcss';
import { withTranslation } from 'react-i18next';
import StackTrace from 'stacktrace-js';
import 'codemirror/mode/css/css';
import 'codemirror/mode/clike/clike';
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
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/addon/comment/comment';
import 'codemirror/keymap/sublime';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/match-highlighter';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/selection/mark-selection';
import 'codemirror/addon/hint/css-hint';
import 'codemirror-colorpicker';

import { JSHINT } from 'jshint';
import { CSSLint } from 'csslint';
import { HTMLHint } from 'htmlhint';
import classNames from 'classnames';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import MediaQuery from 'react-responsive';
import '../../../../utils/htmlmixed';
import '../../../../utils/p5-javascript';
import { metaKey } from '../../../../utils/metaKey';
import '../show-hint';
import * as hinter from '../../../../utils/p5-hinter';
import '../../../../utils/codemirror-search';

import beepUrl from '../../../../sounds/audioAlert.mp3';
import RightArrowIcon from '../../../../images/right-arrow.svg';
import LeftArrowIcon from '../../../../images/left-arrow.svg';
import { getHTMLFile } from '../../reducers/files';
import { selectActiveFile } from '../../selectors/files';

import * as FileActions from '../../actions/files';
import * as IDEActions from '../../actions/ide';
import * as ProjectActions from '../../actions/project';
import * as EditorAccessibilityActions from '../../actions/editorAccessibility';
import * as PreferencesActions from '../../actions/preferences';
import * as UserActions from '../../../User/actions';
import * as ConsoleActions from '../../actions/console';

import AssetPreview from '../AssetPreview';
import Timer from '../Timer';
import EditorAccessibility from '../EditorAccessibility';
import UnsavedChangesIndicator from '../UnsavedChangesIndicator';
import { EditorContainer, EditorHolder } from './MobileEditor';
import { FolderIcon } from '../../../../common/icons';
import IconButton from '../../../../common/IconButton';

emmet(CodeMirror);

window.JSHINT = JSHINT;
window.CSSLint = CSSLint;
window.HTMLHint = HTMLHint;

const INDENTATION_AMOUNT = 2;

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLine: 1
    };
    this._cm = null;
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
    // this.widgets = [];
    this._cm = CodeMirror(this.codemirrorContainer, {
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
          esversion: 11
        }
      },
      colorpicker: {
        type: 'sketch',
        mode: 'edit'
      }
    });

    this.hinter = new Fuse(hinter.p5Hinter, {
      threshold: 0.05,
      keys: ['text']
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
      [`Shift-Tab`]: false,
      [`${metaKey}-Enter`]: () => null,
      [`Shift-${metaKey}-Enter`]: () => null,
      [`${metaKey}-F`]: 'findPersistent',
      [`Shift-${metaKey}-F`]: this.tidyCode,
      [`${metaKey}-G`]: 'findPersistentNext',
      [`Shift-${metaKey}-G`]: 'findPersistentPrev',
      [replaceCommand]: 'replace',
      // Cassie Tarakajian: If you don't set a default color, then when you
      // choose a color, it deletes characters inline. This is a
      // hack to prevent that.
      [`${metaKey}-K`]: (cm, event) =>
        cm.state.colorpicker.popup_color_picker({ length: 0 }),
      [`${metaKey}-.`]: 'toggleComment' // Note: most adblockers use the shortcut ctrl+.
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
          this.props.startSketch();
        }
      }, 1000)
    );

    if (this._cm) {
      this._cm.on('keyup', this.handleKeyUp);
    }

    this._cm.on('keydown', (_cm, e) => {
      // Show hint
      const mode = this._cm.getOption('mode');
      if (/^[a-z]$/i.test(e.key) && (mode === 'css' || mode === 'javascript')) {
        this.showHint(_cm);
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
    if (this.props.file.id !== prevProps.file.id) {
      const fileMode = this.getFileMode(this.props.file.name);
      if (fileMode === 'javascript') {
        // Define the new Emmet configuration based on the file mode
        const emmetConfig = {
          preview: ['html'],
          markTagPairs: false,
          autoRenameTags: true
        };
        this._cm.setOption('emmet', emmetConfig);
      }
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
    if (this.props.autocompleteHinter !== prevProps.autocompleteHinter) {
      if (!this.props.autocompleteHinter) {
        // close the hinter window once the preference is turned off
        CodeMirror.showHint(this._cm, () => {}, {});
      }
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
              this._cm.addLineClass(
                line.lineNumber - 1,
                'background',
                'line-runtime-error'
              );
            });
          }
        });
      } else {
        for (let i = 0; i < this._cm.lineCount(); i += 1) {
          this._cm.removeLineClass(i, 'background', 'line-runtime-error');
        }
      }
    }

    if (this.props.file.id !== prevProps.file.id) {
      for (let i = 0; i < this._cm.lineCount(); i += 1) {
        this._cm.removeLineClass(i, 'background', 'line-runtime-error');
      }
    }

    this.props.provideController({
      tidyCode: this.tidyCode,
      showFind: this.showFind,
      showReplace: this.showReplace,
      getContent: this.getContent
    });
  }

  componentWillUnmount() {
    if (this._cm) {
      this._cm.off('keyup', this.handleKeyUp);
    }
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
    } else if (fileName.match(/.+\.(vert|stl|mtl)$/i)) {
      mode = 'x-shader/x-vertex';
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

  handleKeyUp = () => {
    const lineNumber = parseInt(this._cm.getCursor().line + 1, 10);
    this.setState({ currentLine: lineNumber });
  };

  showFind() {
    this._cm.execCommand('findPersistent');
  }

  showHint(_cm) {
    if (!this.props.autocompleteHinter) {
      CodeMirror.showHint(_cm, () => {}, {});
      return;
    }

    let focusedLinkElement = null;
    const setFocusedLinkElement = (set) => {
      if (set && !focusedLinkElement) {
        const activeItemLink = document.querySelector(
          `.CodeMirror-hint-active a`
        );
        if (activeItemLink) {
          focusedLinkElement = activeItemLink;
          focusedLinkElement.classList.add('focused-hint-link');
          focusedLinkElement.parentElement.parentElement.classList.add(
            'unfocused'
          );
        }
      }
    };
    const removeFocusedLinkElement = () => {
      if (focusedLinkElement) {
        focusedLinkElement.classList.remove('focused-hint-link');
        focusedLinkElement.parentElement.parentElement.classList.remove(
          'unfocused'
        );
        focusedLinkElement = null;
        return true;
      }
      return false;
    };

    const hintOptions = {
      _fontSize: this.props.fontSize,
      completeSingle: false,
      extraKeys: {
        'Shift-Right': (cm, e) => {
          const activeItemLink = document.querySelector(
            `.CodeMirror-hint-active a`
          );
          if (activeItemLink) activeItemLink.click();
        },
        Right: (cm, e) => {
          setFocusedLinkElement(true);
        },
        Left: (cm, e) => {
          removeFocusedLinkElement();
        },
        Up: (cm, e) => {
          const onLink = removeFocusedLinkElement();
          e.moveFocus(-1);
          setFocusedLinkElement(onLink);
        },
        Down: (cm, e) => {
          const onLink = removeFocusedLinkElement();
          e.moveFocus(1);
          setFocusedLinkElement(onLink);
        },
        Enter: (cm, e) => {
          if (focusedLinkElement) focusedLinkElement.click();
          else e.pick();
        }
      },
      closeOnUnfocus: false
    };

    if (_cm.options.mode === 'javascript') {
      // JavaScript
      CodeMirror.showHint(
        _cm,
        () => {
          const c = _cm.getCursor();
          const token = _cm.getTokenAt(c);

          const hints = this.hinter
            .search(token.string)
            .filter((h) => h.item.text[0] === token.string[0]);

          return {
            list: hints,
            from: CodeMirror.Pos(c.line, token.start),
            to: CodeMirror.Pos(c.line, c.ch)
          };
        },
        hintOptions
      );
    } else if (_cm.options.mode === 'css') {
      // CSS
      CodeMirror.showHint(_cm, CodeMirror.hint.css, hintOptions);
    }
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
      const { left, top } = this._cm.getScrollInfo();
      this._cm.doc.setValue(formatted);
      this._cm.focus();
      this._cm.doc.setCursor(this._cm.doc.posFromIndex(cursorOffset));
      this._cm.scrollTo(left, top);
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

    const { currentLine } = this.state;

    return (
      <MediaQuery minWidth={770}>
        {(matches) =>
          matches ? (
            <section className={editorSectionClass}>
              <div className="editor__header">
                <button
                  aria-label={this.props.t('Editor.OpenSketchARIA')}
                  className="sidebar__contract"
                  onClick={() => {
                    this.props.collapseSidebar();
                    this.props.closeProjectOptions();
                  }}
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
                    <UnsavedChangesIndicator />
                  </span>
                  <Timer />
                </div>
              </div>
              <article
                ref={(element) => {
                  this.codemirrorContainer = element;
                }}
                className={editorHolderClass}
              />
              {this.props.file.url ? (
                <AssetPreview
                  url={this.props.file.url}
                  name={this.props.file.name}
                />
              ) : null}
              <EditorAccessibility
                lintMessages={this.props.lintMessages}
                currentLine={currentLine}
              />
            </section>
          ) : (
            <EditorContainer expanded={this.props.isExpanded}>
              <div>
                <IconButton
                  onClick={this.props.expandSidebar}
                  icon={FolderIcon}
                />
                <span>
                  {this.props.file.name}
                  <UnsavedChangesIndicator />
                </span>
              </div>
              <section>
                <EditorHolder
                  ref={(element) => {
                    this.codemirrorContainer = element;
                  }}
                />
                {this.props.file.url ? (
                  <AssetPreview
                    url={this.props.file.url}
                    name={this.props.file.name}
                  />
                ) : null}
                <EditorAccessibility
                  lintMessages={this.props.lintMessages}
                  currentLine={currentLine}
                />
              </section>
            </EditorContainer>
          )
        }
      </MediaQuery>
    );
  }
}

Editor.propTypes = {
  autocloseBracketsQuotes: PropTypes.bool.isRequired,
  autocompleteHinter: PropTypes.bool.isRequired,
  lineNumbers: PropTypes.bool.isRequired,
  lintWarning: PropTypes.bool.isRequired,
  linewrap: PropTypes.bool.isRequired,
  lintMessages: PropTypes.arrayOf(
    PropTypes.shape({
      severity: PropTypes.oneOf(['error', 'hint', 'info', 'warning'])
        .isRequired,
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
  startSketch: PropTypes.func.isRequired,
  autorefresh: PropTypes.bool.isRequired,
  isPlaying: PropTypes.bool.isRequired,
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
  closeProjectOptions: PropTypes.func.isRequired,
  expandSidebar: PropTypes.func.isRequired,
  clearConsole: PropTypes.func.isRequired,
  hideRuntimeErrorWarning: PropTypes.func.isRequired,
  runtimeErrorWarningVisible: PropTypes.bool.isRequired,
  provideController: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  setSelectedFile: PropTypes.func.isRequired,
  expandConsole: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    files: state.files,
    file: selectActiveFile(state),
    htmlFile: getHTMLFile(state.files),
    ide: state.ide,
    preferences: state.preferences,
    editorAccessibility: state.editorAccessibility,
    user: state.user,
    project: state.project,
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
      ConsoleActions
    ),
    dispatch
  );
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(Editor)
);
