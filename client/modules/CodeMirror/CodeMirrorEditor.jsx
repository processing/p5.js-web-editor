import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import {
  bracketMatching,
  syntaxHighlighting,
  codeFolding,
  foldGutter
} from '@codemirror/language';
import { linter, lintGutter } from '@codemirror/lint';
import {
  openSearchPanel,
  replaceNext,
  search,
  searchKeymap
} from '@codemirror/search';
import {
  Compartment,
  StateField,
  StateEffect,
  RangeSetBuilder
} from '@codemirror/state';
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  Decoration,
  DecorationSet,
  ViewUpdate,
  ViewPlugin
} from '@codemirror/view';
import {
  abbreviationTracker,
  emmetConfig,
  expandAbbreviation
} from '@emmetio/codemirror6-plugin';
import { classHighlighter } from '@lezer/highlight';
import { color, colorView, colorTheme } from '@uiw/codemirror-extensions-color';
import classNames from 'classnames';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { connect, useDispatch } from 'react-redux';
import StackTrace from 'stacktrace-js';
import beepUrl from '../../sounds/audioAlert.mp3';
import { metaKey } from '../../utils/metaKey';
import { selectActiveFile } from '../IDE/selectors/files';
import CodeMirrorSearch from './CodeMirrorSearch';
import CoreStyled from './CoreStyled';
import p5StylePlugin from './highlightP5Vars';
import p5Autocomplete from './p5Autocomplete';
import tidyCode from './tidyCode';
import { getFileExtension, getLanguageSupport } from './language';
import lintSource from './linting';
import {
  updateLintMessage,
  clearLintMessage
} from '../IDE/actions/editorAccessibility';
import {
  setUnsavedChanges,
  setSelectedFile,
  expandConsole,
  startSketch,
  showRuntimeErrorWarning,
  hideRuntimeErrorWarning
} from '../IDE/actions/ide';
import baseP5Theme from './baseTheme';
import runtimeErrorExt, {
  clearRuntimeErrorsEffect,
  clearRuntimeErrors,
  setRuntimeErrorsEffect
} from './runtimeErrors';

// TODO: setup/check emmet & fix class names
// https://github.com/emmetio/codemirror6-plugin/blob/de142116cbe4003c22a79436351ead9b600ae6e3/src/lib/syntax.ts#LL113C17-L113C28
// https://docs.emmet.io/actions/

// TODO: autocomplete prevents 'div' + tab from auto-closing

const INDENTATION_AMOUNT = 2;

const searchContainer = document.createElement('div');
searchContainer.id = 'p5-search-panel';

const EditorNew = ({ provideController }) => {
  const dispatch = useDispatch();

  const containerRef = useRef(null);

  const editorRef = useRef(null);

  const compartments = useRef({
    language: new Compartment(),
    lineWrap: new Compartment(),
    lineNumbers: new Compartment(),
    emmet: new Compartment(),
    abbrTracker: new Compartment()
  });
};

EditorNew.propTypes = {
  provideController: PropTypes.func.isRequired
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
      this.props.dispatch(clearLintMessage());
      annotations.forEach((x) => {
        if (x.from.line > -1) {
          this.props.dispatch(
            updateLintMessage(x.severity, x.from.line + 1, x.message)
          );
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
    this.compartments = {
      language: new Compartment(),
      lineWrap: new Compartment(),
      lineNumbers: new Compartment(),
      emmet: new Compartment(),
      abbrTracker: new Compartment()
    };
    const fileExt = getFileExtension(this.props.file.name);
    const currentLangSupport = getLanguageSupport(fileExt);
    this._cm = new EditorView({
      extensions: [
        history(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          {
            key: 'Mod-e', // TODO
            run: expandAbbreviation
          }
        ]),
        this.compartments.language.of(currentLangSupport),
        this.compartments.lineWrap.of(
          this.props.linewrap ? EditorView.lineWrapping : []
        ),
        this.compartments.emmet.of(
          emmetConfig.of({
            // Note: not all file extensions are valid
            syntax: fileExt
          })
        ),
        this.compartments.abbrTracker.of(
          abbreviationTracker({
            syntax: fileExt
          })
        ),
        syntaxHighlighting(classHighlighter),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        p5Autocomplete,
        // TODO: switch
        // p5LightCodemirrorTheme,
        baseP5Theme,
        p5StylePlugin,
        bracketMatching(),
        linter(lintSource),
        lintGutter(),
        runtimeErrorExt,
        // TODO: switch to an alpha bg to keep numbers visible. #00000005
        this.compartments.lineNumbers.of(
          this.props.lineNumbers ? lineNumbers() : []
        ),
        codeFolding(),
        foldGutter({
          /* markerDOM: (open) => {
            const img = document.createElement('img');
            img.src = arrowIconUrl;
            img.style.transform = `rotate(${open ? '90deg' : 0})`;
            return img;
            // TODO: correct color based on theme
          } */
          openText: '▼',
          closedText: '▶'
        }),
        // TODO: remove
        search({
          top: true,
          createPanel: () => ({
            dom: searchContainer
          })
        }),
        color
        // highlightSelectionMatches() // Not enabled currently, no sure if wanted
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
        this.props.dispatch(setUnsavedChanges(true));
        this.props.dispatch(hideRuntimeErrorWarning());
        this.props.dispatch(updateFileContent(
          this.props.file.id,
          this._cm.state.doc.toString()
        ));
        if (this.props.autorefresh && this.props.isPlaying) {
          this.props.dispatch(clearConsole());
          this.props.dispatch(startSketch());
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
        setTimeout(() => this.props.dispatch(setUnsavedChanges(false)), 400);
      }
    }
    if (this.props.file.name !== prevProps.file.name) {
      const fileExt = getFileExtension(this.props.file.name);
      this._cm.dispatch({
        effects: [
          this.compartments.language.reconfigure(getLanguageSupport(fileExt)),
          this.compartments.emmet.reconfigure(
            emmetConfig.of({
              syntax: fileExt
            })
          ),
          this.compartments.abbrTracker.reconfigure(
            abbreviationTracker({
              syntax: fileExt
            })
          )
        ]
      });
    }
    if (this.props.linewrap !== prevProps.linewrap) {
      this._cm.dispatch({
        effects: this.compartments.lineWrap.reconfigure(
          this.props.linewrap ? EditorView.lineWrapping : []
        )
      });
    }
    if (this.props.theme !== prevProps.theme) {
      // this._cm5.setOption('theme', `p5-${this.props.theme}`);
    }
    if (this.props.lineNumbers !== prevProps.lineNumbers) {
      this._cm.dispatch({
        effects: this.compartments.lineNumbers.reconfigure(
          this.props.lineNumbers ? lineNumbers() : []
        )
      });
    }
    if (
      this.props.autocloseBracketsQuotes !== prevProps.autocloseBracketsQuotes
    ) {
      /* this._cm5.setOption(
        'autoCloseBrackets',
        this.props.autocloseBracketsQuotes
      ); */
    }

    // TODO: figure out how it works currently with the show/hide.
    if (this.props.runtimeErrorWarningVisible) {
      if (this.props.consoleEvents.length !== prevProps.consoleEvents.length) {
        this.props.consoleEvents.forEach((consoleEvent) => {
          if (consoleEvent.method === 'error') {
            // It doesn't work if you create a new Error, but this works
            // LOL
            const errorObj = { stack: consoleEvent.data[0].toString() };
            StackTrace.fromError(errorObj).then((stackLines) => {
              this.props.dispatch(expandConsole());
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
              this.props.dispatch(setSelectedFile(fileWithError.id));
              // Note: will only show max 1 at a time.
              // TODO: instead of addLineClass, use line decorations:
              // https://codemirror.net/examples/zebra/
              // https://discuss.codemirror.net/t/how-to-add-line-class-to-a-specific-line-dynamically/6230
              // https://discuss.codemirror.net/t/equivalent-for-addlineclass-in-cm6/4356
              // https://discuss.codemirror.net/t/how-to-add-classes-to-lines/3039/3
              console.log('error', line);
              // TODO: why doesn't the decoration show up?
              this._cm.dispatch({
                effects: [
                  setRuntimeErrorsEffect.of({
                    // TODO: pass the message and show it in a lint tooltip
                    message: '',
                    line: line.lineNumber
                  })
                ]
              });
            });
          }
        });
      } else {
        clearRuntimeErrors(this._cm);
      }
    }

    if (this.props.file.id !== prevProps.file.id) {
      clearRuntimeErrors(this._cm);
    }
  }

  componentWillUnmount() {
    this._cm5 = null;
    this._cm.destroy();
    this._cm = null;
    this.props.provideController(null);
  }

  getContent() {
    return {
      ...this.props.file,
      content: this._cm.state.doc.toString()
    };
  }

  showFind() {
    openSearchPanel(this._cm);
  }

  showReplace() {
    // this._cm5.execCommand('replace');
    // TODO: how to open with replace section expanded?
    // openSearchPanel(this._cm);
    replaceNext(this._cm);
  }

  tidyCode() {
    tidyCode(this._cm, this.props.file.name);
  }

  replaceFileContent(content) {
    this._cm.dispatch({
      changes: { from: 0, to: this._cm.state.doc.length, insert: content }
    });
  }

  render() {
    const editorHolderClass = classNames({
      'editor-holder': true,
      'editor-holder--hidden':
        this.props.file.fileType === 'folder' || this.props.file.url,
      [`cm-s-p5-${this.props.theme}`]: true
    });

    return (
      <>
        <CoreStyled
          ref={(element) => {
            this.codemirrorContainer = element;
          }}
          className={editorHolderClass}
        />
        {this._cm &&
          createPortal(
            <div className="CodeMirror-dialog CodeMirror-dialog-top">
              <CodeMirrorSearch editor={this._cm} />
            </div>,
            searchContainer
          )}
      </>
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
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    url: PropTypes.string
  }).isRequired,
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
  runtimeErrorWarningVisible: PropTypes.bool.isRequired,
  provideController: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    files: state.files,
    file: selectActiveFile(state),
    consoleEvents: state.console,
    ...state.preferences,
    ...state.ide,
    lintMessages: state.editorAccessibility.lintMessages,
    unsavedChanges: state.ide.unsavedChanges,
    runtimeErrorWarningVisible: state.ide.runtimeErrorWarningVisible
  };
}

export default connect(mapStateToProps)(Editor);
