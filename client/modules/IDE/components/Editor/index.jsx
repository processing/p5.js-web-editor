// TODO: convert to functional component
import React, { useEffect, useMemo, useRef } from 'react';
import CodeMirror from 'codemirror';
import Fuse from 'fuse.js';
import emmet from '@emmetio/codemirror-plugin';
import prettier from 'prettier/standalone';
import babelParser from 'prettier/parser-babel';
import htmlParser from 'prettier/parser-html';
import cssParser from 'prettier/parser-postcss';
import { useTranslation } from 'react-i18next';
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
import { debounce } from 'lodash';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
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

function getFileMode(fileName) {
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

function Editor(props) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  // Defining states to usee
  const files = useSelector((state) => state.files);
  const ide = useSelector((state) => state.ide);
  const file = useSelector(selectActiveFile);
  const project = useSelector((state) => state.project);
  const preferences = useSelector((state) => state.preferences);
  const editorAccessibility = useSelector((state) => state.editorAccessibility);
  const sidebarIsExpanded = useSelector((state) => state.ide.sidebarIsExpanded);
  const consoleEvents = useSelector((state) => state.console);
  const mergedState = {
    ...preferences,
    ...ide,
    ...project,
    ...editorAccessibility,
    isExpanded: sidebarIsExpanded
  };
  // Binding Action Creators
  const funcprop = useMemo(() =>
    bindActionCreators(
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
    )
  );
  // refs for codemirror
  const cm = useRef(null);
  // States and refs
  const codemirrorContainer = useRef(null);

  function prettierFormatWithCursor(parser, plugins) {
    try {
      const { formatted, cursorOffset } = prettier.formatWithCursor(
        cm.current.doc.getValue(),
        {
          cursorOffset: cm.current.doc.indexFromPos(cm.current.doc.getCursor()),
          parser,
          plugins
        }
      );
      const { left, top } = cm.current.getScrollInfo();
      cm.current.doc.setValue(formatted);
      cm.current.focus();
      cm.current.doc.setCursor(cm.current.doc.posFromIndex(cursorOffset));
      cm.current.scrollTo(left, top);
    } catch (error) {
      console.error(error);
    }
  }
  function tidyCode() {
    const mode = cm.current.getOption('mode');
    if (mode === 'javascript') {
      prettierFormatWithCursor('babel', [babelParser]);
    } else if (mode === 'css') {
      prettierFormatWithCursor('css', [cssParser]);
    } else if (mode === 'htmlmixed') {
      prettierFormatWithCursor('html', [htmlParser]);
    }
  }
  const getContent = () => {
    const content = cm.current.getValue();
    const updatedFile = Object.assign({}, file, { content });
    return updatedFile;
  };

  function showFind() {
    cm.current.execCommand('findPersistent');
  }

  function showReplace() {
    cm.current.execCommand('replace');
  }

  // Inialize main Content
  const beep = new Audio(beepUrl);
  const lintMessagesRef = useRef(mergedState.lintMessages);
  const lintWarningRef = useRef(mergedState.lintWarning);

  useEffect(() => {
    lintMessagesRef.current = mergedState.lintMessages;
    lintWarningRef.current = mergedState.lintWarning;
  }, [mergedState.lintMessages, mergedState.lintWarning]);

  const updateLintingMessageAccessibility = debounce((annotations) => {
    funcprop.clearLintMessage();
    annotations.forEach((x) => {
      if (x.from.line > -1) {
        funcprop.updateLintMessage(x.severity, x.from.line + 1, x.message);
      }
    });
    if (lintMessagesRef.current.length > 0 && lintWarningRef.current) {
      beep.play();
    }
  }, 2000);

  useEffect(() => {
    cm.current = CodeMirror(codemirrorContainer.current, {
      theme: `p5-${mergedState.theme}`,
      lineNumbers: mergedState.lineNumbers,
      styleActiveLine: true,
      inputStyle: 'contenteditable',
      lineWrapping: mergedState.linewrap,
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
      autoCloseBrackets: mergedState.autocloseBracketsQuotes,
      styleSelectedText: true,
      lint: {
        onUpdateLinting: (annotations) => {
          updateLintingMessageAccessibility(annotations);
        },
        options: {
          asi: true,
          eqeqeq: false,
          '-W041': false,
          esversion: 7
        }
      },
      colorpicker: {
        type: 'sketch',
        mode: 'edit'
      }
    });
  }, []);

  useEffect(() => {
    cm.current.setOption('theme', `p5-${mergedState.theme}`);
    cm.current.setOption(
      'autoCloseBrackets',
      mergedState.autocloseBracketsQuotes
    );
    cm.current.setOption('lineNumbers', mergedState.lineNumbers);
    cm.current.setOption('lineWrapping', mergedState.linewrap);
  }, [
    mergedState.theme,
    mergedState.autocloseBracketsQuotes,
    mergedState.lineNumbers,
    mergedState.linewrap
  ]);

  useEffect(() => {
    if (!mergedState.unsavedChanges) {
      setTimeout(() => funcprop.setUnsavedChanges(false), 400);
    }
  }, [mergedState.unsavedChanges]);

  useEffect(() => {
    delete cm.current.options.lint.options.errors;

    const replaceCommand =
      metaKey === 'Ctrl' ? `${metaKey}-H` : `${metaKey}-Option-F`;
    cm.current.setOption('extraKeys', {
      Tab: (_cm) => {
        if (!_cm.execCommand('emmetExpandAbbreviation')) return;
        // might need to specify and indent more?
        const selection = _cm.doc.getSelection();
        if (selection.length > 0) {
          _cm.execCommand('indentMore');
        } else {
          _cm.replaceSelection(' '.repeat(INDENTATION_AMOUNT));
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
      // Cassie Tarakajian: If you don't set a default color, then when you
      // choose a color, it deletes characters inline. This is a
      // hack to prevent that.
      [`${metaKey}-K`]: (_cm, event) =>
        _cm.state.colorpicker.popup_color_picker({ length: 0 }),
      [`${metaKey}-.`]: 'toggleComment' // Note: most adblockers use the shortcut ctrl+.
    });

    if (cm.current) {
      const docs = {};
      files.forEach((fileitem) => {
        if (fileitem.name !== 'root') {
          docs[fileitem.id] = CodeMirror.Doc(
            fileitem.content,
            getFileMode(fileitem.name)
          ); // eslint-disable-line
        }
      });
      cm.current.swapDoc(docs[file.id]);
    }

    // eslint-disable-next-line react/prop-types
    props.provideController({
      tidyCode,
      showFind,
      showReplace,
      getContent
    });
    return () => {
      cm.current = null;
      // eslint-disable-next-line react/prop-types
      props.provideController(null);
    };
  }, []);

  useEffect(() => {
    cm.current.getWrapperElement().style[
      'font-size'
    ] = `${mergedState.fontSize}px`;
  }, [mergedState.fontSize]);
  //
  useEffect(() => {
    const hinterar = new Fuse(hinter.p5Hinter, {
      threshold: 0.05,
      keys: ['text']
    });
    const showHint = (_cm) => {
      if (!mergedState.autocompleteHinter) {
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
        _fontSize: mergedState.fontSize,
        completeSingle: false,
        extraKeys: {
          'Shift-Right': (cmm, e) => {
            const activeItemLink = document.querySelector(
              `.CodeMirror-hint-active a`
            );
            if (activeItemLink) activeItemLink.click();
          },
          Right: (cmm, e) => {
            setFocusedLinkElement(true);
          },
          Left: (cmm, e) => {
            removeFocusedLinkElement();
          },
          Up: (cmm, e) => {
            const onLink = removeFocusedLinkElement();
            e.moveFocus(-1);
            setFocusedLinkElement(onLink);
          },
          Down: (cmm, e) => {
            const onLink = removeFocusedLinkElement();
            e.moveFocus(1);
            setFocusedLinkElement(onLink);
          },
          Enter: (cmm, e) => {
            if (focusedLinkElement) focusedLinkElement.click();
            else e.pick();
          }
        },
        closeOnUnfocus: false
      };
      if (cm.current.options.mode === 'javascript') {
        // JavaScript
        CodeMirror.showHint(
          cm.current,
          () => {
            const c = cm.current.getCursor();
            const token = cm.current.getTokenAt(c);
            const hints = hinterar
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
      } else if (cm.current.options.mode === 'css') {
        // CSS
        CodeMirror.showHint(cm.current, CodeMirror.hint.css, hintOptions);
      }
    };

    cm.current.on('keyup', () => {
      const temp = t('Editor.KeyUpLineNumber', {
        lineNumber: parseInt(cm.current.getCursor().line + 1, 10)
      });
      document.getElementById('current-line').innerHTML = temp;
    });

    cm.current.on('keydown', (cmm, e) => {
      // Show hint
      const mode = cmm.getOption('mode');
      if (/^[a-z]$/i.test(e.key) && (mode === 'css' || mode === 'javascript')) {
        showHint(cmm);
      }
    });
  }, [mergedState.autocompleteHinter]);
  const updateDon = () => {
    // eslint-disable-next-line react/prop-types
    props.provideController({
      tidyCode,
      showFind,
      showReplace,
      getContent
    });
  };

  useEffect(() => {
    if (mergedState.runtimeErrorWarningVisible) {
      if (consoleEvents) {
        if (consoleEvents.length > 0) {
          consoleEvents.forEach((consoleEvent) => {
            if (consoleEvent.method === 'error') {
              // It doesn't work if you create a new Error, but this works
              // LOL
              const errorObj = { stack: consoleEvent.data[0].toString() };
              StackTrace.fromError(errorObj).then((stackLines) => {
                funcprop.expandConsole();
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
                funcprop.setSelectedFile(fileWithError.id);
                cm.current.addLineClass(
                  line.lineNumber - 1,
                  'background',
                  'line-runtime-error'
                );
              });
            }
          });
        }
      } else {
        for (let i = 0; i < cm.current.lineCount(); i += 1) {
          cm.current.removeLineClass(i, 'background', 'line-runtime-error');
        }
      }
    }

    if (file.id) {
      for (let i = 0; i < cm.current.lineCount(); i += 1) {
        cm.current.removeLineClass(i, 'background', 'line-runtime-error');
      }
    }
  }, [consoleEvents]);
  useEffect(() => {
    const oldDoc = {};
    if (cm.current) {
      files.forEach((fileitem) => {
        if (fileitem.name !== 'root') {
          oldDoc[fileitem.id] = CodeMirror.Doc(
            fileitem.content,
            getFileMode(fileitem.name)
          ); // eslint-disable-line
        }
      });
      cm.current.swapDoc(oldDoc[file.id]);
    }
    cm.current.focus();
    const handleChange = () => {
      funcprop.setUnsavedChanges(true);
      funcprop.hideRuntimeErrorWarning();
      funcprop.updateFileContent(file.id, cm.current.getValue());
      if (mergedState.autorefresh && mergedState.isPlaying) {
        funcprop.clearConsole();
        funcprop.startSketch();
      }
    };
    updateDon();
    cm.current.on('change', handleChange);
    return () => {
      if (cm.current) {
        cm.current.off('change', handleChange);
      }
    };
  }, [file.id]);

  const editorSectionClass = classNames({
    editor: true,
    'sidebar--contracted': !mergedState.isExpanded
  });

  const editorHolderClass = classNames({
    'editor-holder': true,
    'editor-holder--hidden': file.fileType === 'folder' || file.url
  });

  return (
    <div>
      <MediaQuery minWidth={770}>
        {(matches) =>
          matches ? (
            <section className={editorSectionClass}>
              <header className="editor__header">
                <button
                  aria-label={t('Editor.OpenSketchARIA')}
                  className="sidebar__contract"
                  onClick={() => {
                    funcprop.collapseSidebar();
                    funcprop.closeProjectOptions();
                  }}
                >
                  <LeftArrowIcon focusable="false" aria-hidden="true" />
                </button>
                <button
                  aria-label={t('Editor.CloseSketchARIA')}
                  className="sidebar__expand"
                  onClick={funcprop.expandSidebar}
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
              </header>
              <article
                ref={codemirrorContainer}
                className={editorHolderClass}
              />
              {file.url ? (
                <AssetPreview url={file.url} name={file.name} />
              ) : null}
              <EditorAccessibility lintMessages={mergedState.lintMessages} />
            </section>
          ) : (
            <EditorContainer expanded={mergedState.isExpanded}>
              <header>
                <IconButton
                  onClick={funcprop.expandSidebar}
                  icon={FolderIcon}
                />
                <span>
                  {file.name}
                  <UnsavedChangesIndicator />
                </span>
              </header>
              <section>
                <EditorHolder ref={codemirrorContainer} />
                {file.url ? (
                  <AssetPreview url={file.url} name={file.name} />
                ) : null}
                <EditorAccessibility lintMessages={mergedState.lintMessages} />
              </section>
            </EditorContainer>
          )
        }
      </MediaQuery>
    </div>
  );
}

export default Editor;
