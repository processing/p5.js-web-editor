import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState, useCallback } from 'react';
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

const getFileMode = (fileName) => {
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
};

const prettierFormatWithCursor = (cmInstance, parser, plugins) => {
  try {
    const { formatted, cursorOffset } = prettier.formatWithCursor(
      cmInstance.doc.getValue(),
      {
        cursorOffset: cmInstance.doc.indexFromPos(cmInstance.doc.getCursor()),
        parser,
        plugins
      }
    );
    const { left, top } = cmInstance.getScrollInfo();
    cmInstance.doc.setValue(formatted);
    cmInstance.focus();
    cmInstance.doc.setCursor(cmInstance.doc.posFromIndex(cursorOffset));
    cmInstance.scrollTo(left, top);
  } catch (error) {
    console.error(error);
  }
};

const Editor = (props) => {
  const [currentLine, setCurrentLine] = useState(1);
  const codemirrorContainer = useRef(null);
  const cmInstance = useRef(null);
  const beep = useRef(null);
  const docs = useRef({});

  const {
    files,
    file,
    theme,
    lineNumbers,
    linewrap,
    autocloseBracketsQuotes,
    autocompleteHinter,
    fontSize,
    lintMessages,
    lintWarning,
    consoleEvents,
    runtimeErrorWarningVisible,
    unsavedChanges,
    isPlaying,
    autorefresh,
    isExpanded,
    collapseSidebar,
    closeProjectOptions,
    expandSidebar,
    setUnsavedChanges,
    hideRuntimeErrorWarning,
    updateFileContent,
    clearConsole,
    startSketch,
    expandConsole,
    setSelectedFile,
    t,
    provideController,
    clearLintMessage,
    updateLintMessage
  } = props;

  const tidyCode = useCallback(() => {
    const mode = cmInstance.current.getOption('mode');
    if (mode === 'javascript') {
      prettierFormatWithCursor(cmInstance.current, 'babel', [babelParser]);
    } else if (mode === 'css') {
      prettierFormatWithCursor(cmInstance.current, 'css', [cssParser]);
    } else if (mode === 'htmlmixed') {
      prettierFormatWithCursor(cmInstance.current, 'html', [htmlParser]);
    }
  }, []);

  const updateLintingMessageAccessibility = useCallback(
    debounce((annotations) => {
      clearLintMessage();
      annotations.forEach((x) => {
        if (x.from.line > -1) {
          updateLintMessage(x.severity, x.from.line + 1, x.message);
        }
      });
      if (lintMessages.length > 0 && lintWarning) {
        beep.current.play();
      }
    }, 2000),
    [clearLintMessage, updateLintMessage, lintMessages.length, lintWarning]
  );

  const showFind = useCallback(() => {
    cmInstance.current.execCommand('findPersistent');
  }, []);

  const showReplace = useCallback(() => {
    cmInstance.current.execCommand('replace');
  }, []);

  const getContent = useCallback(() => {
    const content = cmInstance.current.getValue();
    return { ...file, content };
  }, [file]);

  const handleKeyUp = useCallback(() => {
    const lineNumber = parseInt(cmInstance.current.getCursor().line + 1, 10);
    setCurrentLine(lineNumber);
  }, []);

  const showHint = useCallback(
    (_cm) => {
      if (!autocompleteHinter) {
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
        _fontSize: fontSize,
        completeSingle: false,
        extraKeys: {
          'Shift-Right': (cm) => {
            const activeItemLink = document.querySelector(
              `.CodeMirror-hint-active a`
            );
            if (activeItemLink) activeItemLink.click();
          },
          Right: (cm) => {
            setFocusedLinkElement(true);
          },
          Left: (cm) => {
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
        CodeMirror.showHint(
          _cm,
          () => {
            const c = _cm.getCursor();
            const token = _cm.getTokenAt(c);

            const hints = hinter.p5Hinter
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
        CodeMirror.showHint(_cm, CodeMirror.hint.css, hintOptions);
      }
    },
    [autocompleteHinter, fontSize]
  );

  useEffect(() => {
    beep.current = new Audio(beepUrl);
    cmInstance.current = CodeMirror(codemirrorContainer.current, {
      theme: `p5-${theme}`,
      lineNumbers,
      styleActiveLine: true,
      inputStyle: 'contenteditable',
      lineWrapping: linewrap,
      fixedGutter: false,
      foldGutter: true,
      foldOptions: { widget: '\u2026' },
      gutters: ['CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      keyMap: 'sublime',
      highlightSelectionMatches: true,
      matchBrackets: true,
      emmet: {
        preview: ['html'],
        markTagPairs: true,
        autoRenameTags: true
      },
      autoCloseBrackets: autocloseBracketsQuotes,
      styleSelectedText: true,
      lint: {
        onUpdateLinting: (annotations) => {
          updateLintingMessageAccessibility(annotations);
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

    const cm = cmInstance.current;
    emmet(CodeMirror);

    const replaceCommand =
      metaKey === 'Ctrl' ? `${metaKey}-H` : `${metaKey}-Option-F`;
    cm.setOption('extraKeys', {
      Tab: (_cmInstance) => {
        if (!_cmInstance.execCommand('emmetExpandAbbreviation')) return;
        const selection = _cmInstance.doc.getSelection();
        if (selection.length > 0) {
          _cmInstance.execCommand('indentMore');
        } else {
          _cmInstance.replaceSelection(' '.repeat(INDENTATION_AMOUNT));
        }
      },
      Enter: 'emmetInsertLineBreak',
      Esc: 'emmetResetAbbreviation',
      [`${metaKey}-Enter`]: () => null,
      [`Shift-${metaKey}-Enter`]: () => null,
      [`${metaKey}-F`]: 'findPersistent',
      [`Shift-${metaKey}-F`]: tidyCode,
      [`${metaKey}-G`]: 'findPersistentNext',
      [`Shift-${metaKey}-G`]: 'findPersistentPrev',
      [replaceCommand]: 'replace',
      [`${metaKey}-K`]: (_cmInstMetaKey, event) =>
        _cmInstMetaKey.state.colorpicker.popup_color_picker({ length: 0 }),
      [`${metaKey}-.`]: 'toggleComment'
    });

    cm.on(
      'change',
      debounce(() => {
        setUnsavedChanges(true);
        hideRuntimeErrorWarning();
        updateFileContent(file.id, cm.getValue());
        if (autorefresh && isPlaying) {
          clearConsole();
          startSketch();
        }
      }, 1000)
    );

    if (cm) {
      cm.on('keyup', handleKeyUp);
    }

    cm.on('keydown', (_cm, e) => {
      const mode = cm.getOption('mode');
      if (/^[a-z]$/i.test(e.key) && (mode === 'css' || mode === 'javascript')) {
        showHint(cm);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        cm.getInputField().blur();
      }
    });

    cm.getWrapperElement().style['font-size'] = `${fontSize}px`;

    provideController({
      tidyCode,
      showFind,
      showReplace,
      getContent
    });

    return () => {
      if (cm) {
        cm.off('keyup', handleKeyUp);
      }
      provideController(null);
    };
  }, [
    theme,
    lineNumbers,
    linewrap,
    autocloseBracketsQuotes,
    fontSize,
    tidyCode,
    updateLintingMessageAccessibility,
    setUnsavedChanges,
    hideRuntimeErrorWarning,
    updateFileContent,
    autorefresh,
    isPlaying,
    clearConsole,
    startSketch,
    provideController,
    showFind,
    showReplace,
    getContent,
    handleKeyUp,
    showHint
  ]);

  useEffect(() => {
    const initializeDocuments = (fileList) => {
      docs.current = {};
      fileList.forEach((f) => {
        if (f.name !== 'root') {
          docs.current[f.id] = CodeMirror.Doc(f.content, getFileMode(f.name));
        }
      });
    };

    initializeDocuments(files);
    cmInstance.current.swapDoc(docs.current[file.id]);
  }, [files, file.id]);

  useEffect(() => {
    if (runtimeErrorWarningVisible) {
      if (consoleEvents.length > 0) {
        consoleEvents.forEach((consoleEvent) => {
          if (consoleEvent.method === 'error') {
            const errorObj = { stack: consoleEvent.data[0].toString() };
            StackTrace.fromError(errorObj).then((stackLines) => {
              expandConsole();
              const line = stackLines.find(
                (l) => l.fileName && l.fileName.startsWith('/')
              );
              if (!line) return;
              const fileNameArray = line.fileName.split('/');
              const fileName = fileNameArray.slice(-1)[0];
              const filePath = fileNameArray.slice(0, -1).join('/');
              const fileWithError = files.find(
                (f) => f.name === fileName && f.filePath === filePath
              );
              setSelectedFile(fileWithError.id);
              cmInstance.current.addLineClass(
                line.lineNumber - 1,
                'background',
                'line-runtime-error'
              );
            });
          }
        });
      } else {
        for (let i = 0; i < cmInstance.current.lineCount(); i += 1) {
          cmInstance.current.removeLineClass(
            i,
            'background',
            'line-runtime-error'
          );
        }
      }
    }

    for (let i = 0; i < cmInstance.current.lineCount(); i += 1) {
      cmInstance.current.removeLineClass(i, 'background', 'line-runtime-error');
    }

    provideController({
      tidyCode,
      showFind,
      showReplace,
      getContent
    });
  }, [
    runtimeErrorWarningVisible,
    consoleEvents,
    expandConsole,
    files,
    file.id,
    setSelectedFile,
    provideController,
    tidyCode,
    showFind,
    showReplace,
    getContent
  ]);

  const editorSectionClass = classNames({
    editor: true,
    'sidebar--contracted': !isExpanded
  });

  const editorHolderClass = classNames({
    'editor-holder': true,
    'editor-holder--hidden': file.fileType === 'folder' || file.url
  });

  return (
    <MediaQuery minWidth={770}>
      {(matches) =>
        matches ? (
          <section className={editorSectionClass}>
            <div className="editor__header">
              <button
                aria-label={t('Editor.OpenSketchARIA')}
                className="sidebar__contract"
                onClick={() => {
                  collapseSidebar();
                  closeProjectOptions();
                }}
              >
                <LeftArrowIcon focusable="false" aria-hidden="true" />
              </button>
              <button
                aria-label={t('Editor.CloseSketchARIA')}
                className="sidebar__expand"
                onClick={expandSidebar}
              >
                <RightArrowIcon focusable="false" aria-hidden="true" />
              </button>
              <div className="editor__file-name">
                <span>
                  {file.name}
                  <UnsavedChangesIndicator />
                </span>
                <Timer />
              </div>
            </div>
            <article ref={codemirrorContainer} className={editorHolderClass} />
            {file.url ? <AssetPreview url={file.url} name={file.name} /> : null}
            <EditorAccessibility
              lintMessages={lintMessages}
              currentLine={currentLine}
            />
          </section>
        ) : (
          <EditorContainer expanded={isExpanded}>
            <div>
              <IconButton onClick={expandSidebar} icon={FolderIcon} />
              <span>
                {file.name}
                <UnsavedChangesIndicator />
              </span>
            </div>
            <section>
              <EditorHolder ref={codemirrorContainer} />
              {file.url ? (
                <AssetPreview url={file.url} name={file.name} />
              ) : null}
              <EditorAccessibility
                lintMessages={lintMessages}
                currentLine={currentLine}
              />
            </section>
          </EditorContainer>
        )
      }
    </MediaQuery>
  );
};

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

const mapStateToProps = (state) => ({
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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ...EditorAccessibilityActions,
      ...FileActions,
      ...ProjectActions,
      ...IDEActions,
      ...PreferencesActions,
      ...UserActions,
      ...ConsoleActions
    },
    dispatch
  );

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(Editor)
);
