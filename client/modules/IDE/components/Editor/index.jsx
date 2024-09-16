import PropTypes from 'prop-types';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo
} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import {
  expandAbbreviation,
  abbreviationTracker,
  findPersistentNext,
  findPersistentPrev,
  replaceCommand,
  find
} from '@emmetio/codemirror6-plugin';
import { EditorState } from '@codemirror/state';
import { Decoration, EditorView } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import prettier from 'prettier/standalone';
import babelParser from 'prettier/parser-babel';
import htmlParser from 'prettier/parser-html';
import cssParser from 'prettier/parser-postcss';
import { withTranslation } from 'react-i18next';
import StackTrace from 'stacktrace-js';
import { autocompletion } from '@codemirror/autocomplete';
import { linter, lintGutter } from '@codemirror/lint';
import { keymap } from '@codemirror/view';
import { standardKeymap } from '@codemirror/commands';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
// import MediaQuery from 'react-responsive';
import { JSHINT } from 'jshint';
import { CSSLint } from 'csslint';
import { HTMLHint } from 'htmlhint';

import * as hinter from '../../../../utils/p5-hinter';
import '../../../../utils/htmlmixed';
import '../../../../utils/p5-javascript';
import { metaKey } from '../../../../utils/metaKey';
import beepUrl from '../../../../sounds/audioAlert.mp3';
import RightArrowIcon from '../../../../images/right-arrow.svg';
import LeftArrowIcon from '../../../../images/left-arrow.svg';
import { getHTMLFile } from '../../reducers/files';
import { selectActiveFile } from '../../selectors/files';

import AssetPreview from '../AssetPreview';
import Timer from '../Timer';
import EditorAccessibility from '../EditorAccessibility';
import UnsavedChangesIndicator from '../UnsavedChangesIndicator';
import { EditorContainer, EditorHolder } from './MobileEditor';
import { FolderIcon } from '../../../../common/icons';
import IconButton from '../../../../common/IconButton';

import * as FileActions from '../../actions/files';
import * as IDEActions from '../../actions/ide';
import * as ProjectActions from '../../actions/project';
import * as EditorAccessibilityActions from '../../actions/editorAccessibility';
import * as PreferencesActions from '../../actions/preferences';
import * as UserActions from '../../../User/actions';
import * as ConsoleActions from '../../actions/console';

// emmet(CodeMirror);

window.JSHINT = JSHINT;
window.CSSLint = CSSLint;
window.HTMLHint = HTMLHint;

const INDENTATION_AMOUNT = 2;

// EmmetKnownSyntax, abbreviationTracker, balanceInward, balanceOutward, decrementNumber01, decrementNumber1, decrementNumber10, emmetCompletionSource, emmetConfig, enterAbbreviationMode, evaluateMath, expandAbbreviation, goToNextEditPoint, goToPreviousEditPoint, goToTagPair, incrementNumber01, incrementNumber1, incrementNumber10, removeTag, selectNextItem, selectPreviousItem, splitJoinTag, toggleComment, wrapWithAbbreviation

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
      cmInstance.state.doc.toString(),
      {
        cursorOffset: cmInstance.state.selection.main.head,
        parser,
        plugins
      }
    );
    cmInstance.dispatch({
      changes: { from: 0, to: cmInstance.state.doc.length, insert: formatted }
    });
    cmInstance.focus();
    cmInstance.scrollIntoView({ from: cursorOffset });
  } catch (error) {
    console.error(error);
  }
};

const removeLineDecoration = (view, lineNumber) => {
  const totalLines = view.state.doc.lines; // Total lines in the document

  if (lineNumber > 0 && lineNumber <= totalLines) {
    const line = view.state.doc.line(lineNumber);
    const builder = new RangeSetBuilder();

    // No decoration means removing any existing decoration
    builder.add(line.from, line.from, Decoration.none);

    const transaction = view.state.update({
      effects: view.state.update({
        effects: [view.state.facet(EditorView.decorations.of(builder.finish()))]
      })
    });

    // view.dispatch(transaction);
  } else {
    console.error(
      `Invalid line number ${lineNumber} in ${totalLines}-line document`
    );
  }
};

const Editor = (props) => {
  const [currentLine, setCurrentLine] = useState(1);
  const beep = useRef(null);
  const cmInstance = useRef(null);
  const docs = useRef({});
  const [editorView, setEditorView] = useState(null);
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
    editorView.execCommand('findPersistent');
  }, []);

  const showReplace = useCallback(() => {
    editorView.execCommand('replace');
  }, []);

  const getContent = useCallback(() => {
    const content = editorView.state.doc.toString();
    return { ...file, content };
  }, [file, editorView]);

  const handleKeyUp = useCallback(() => {
    const lineNumber = parseInt(editorView.state.selection.main.head + 1, 10);
    setCurrentLine(lineNumber);
  }, []);

  const showHint = useCallback(
    (_cm) => {
      if (!autocompleteHinter) {
        return null; // Return null explicitly
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

      if (_cm.state.mode === 'javascript') {
        const c = _cm.state.selection.main.head;
        const token = _cm.state.selection.main.head;

        const hints = hinter.p5Hinter
          .search(token.string)
          .filter((h) => h.item.text[0] === token.string[0]);

        return {
          list: hints,
          from: c,
          to: c
        };
      } else if (_cm.state.mode === 'css') {
        return CodeMirror.hint.css;
      }

      return null; // Default return for other modes or no valid condition
    },
    [autocompleteHinter, fontSize]
  );

  const tidyCode = useCallback(() => {
    const mode = getFileMode(file.name);
    if (mode === javascript) {
      prettierFormatWithCursor(editorView, 'babel', [babelParser]);
    } else if (mode === cssParser) {
      prettierFormatWithCursor(editorView, 'css', [cssParser]);
    } else if (mode === htmlParser) {
      prettierFormatWithCursor(editorView, 'html', [htmlParser]);
    }
  }, [file]);

  const debouncedTidyCode = useMemo(() => debounce(tidyCode, 300), [tidyCode]);

  const handleEditorChange = useCallback((value, viewUpdate) => {
    // Handle editor change, such as updating content or line numbers
    const lineNumber = viewUpdate.state.doc.lineAt(
      viewUpdate.state.selection.main.head
    ).number;
    setCurrentLine(lineNumber);
  }, []);

  useEffect(() => {
    const cm = editorView;

    // const replaceCommand =
    //   metaKey === 'Ctrl' ? `${metaKey}-H` : `${metaKey}-Option-F`;

    // cm.on(
    //   'change',
    //   debounce(() => {
    //     setUnsavedChanges(true);
    //     hideRuntimeErrorWarning();
    //     updateFileContent(file.id, cm.state.doc.toString());
    //     if (autorefresh && isPlaying) {
    //       clearConsole();
    //       startSketch();
    //     }
    //   }, 1000)
    // );

    // if (cm) {
    //   cm.on('keyup', handleKeyUp);
    // }

    // cm.on('keydown', (_cm, e) => {
    //   const mode = cm.getOption('mode');
    //   if (/^[a-z]$/i.test(e.key) && (mode === 'css' || mode === 'javascript')) {
    //     showHint(cm);
    //   }
    //   if (e.key === 'Escape') {
    //     e.preventDefault();
    //     cm.getInputField().blur();
    //   }
    // });

    // cm.getWrapperElement().style['font-size'] = `${fontSize}px`;

    provideController({
      debouncedTidyCode,
      showFind,
      showReplace,
      getContent
    });

    return () => {
      if (cm) {
        // cm.off('keyup', handleKeyUp);
      }
      provideController(null);
    };
  }, [
    theme,
    lineNumbers,
    autocloseBracketsQuotes,
    fontSize,
    debouncedTidyCode,
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

  // useEffect(() => {
  //   const initializeDocuments = (fileList) => {
  //     docs.current = {};
  //     fileList.forEach((f) => {
  //       if (f.name !== 'root') {
  //         docs.current[f.id] = CodeMirror.Doc(f.content, getFileMode(f.name));
  //       }
  //     });
  //   };
  //   initializeDocuments(files);
  //   cmInstance.current.swapDoc(docs.current[file.id]);
  // }, [files, file.id]);

  const myLinterFunction = (view) => {
    const diagnostics = [];
    const content = view.state.doc.toString(); // Get the content of the editor

    // Pass the content through JSHint (or any other linter)
    JSHINT(content, {
      asi: true, // Allow missing semicolons
      eqeqeq: false, // Allow non-strict equality (== and !=)
      '-W041': false, // Disable warning for 'use of == null'
      esversion: 11 // Use ECMAScript version 11 (ES2020)
    });

    // Process JSHint results and convert them into CodeMirror diagnostics
    JSHINT.errors.forEach((error) => {
      if (!error) return;

      diagnostics.push({
        from: view.state.doc.line(error.line).from + (error.character - 1), // Position of the error
        to: view.state.doc.line(error.line).from + error.character, // End position of the error
        severity: error.code.startsWith('W') ? 'warning' : 'error', // 'W' indicates a warning in JSHint
        message: error.reason // The error message
      });
    });

    // Call the onUpdateLinting function to handle linting messages
    updateLintingMessageAccessibility(diagnostics);

    return diagnostics;
  };

  useEffect(() => {
    const initializeDocuments = (fileList) => {
      docs.current = {};
      fileList.forEach((f) => {
        if (f.name !== 'root') {
          docs.current[f.id] = EditorState.create({
            doc: f.content || '', // Ensure doc is never undefined, default to empty string
            extensions: [javascript()] // Adjust based on file mode
          });
        }
      });
    };

    initializeDocuments(files);

    // if (cmInstance.current && docs.current[file.id]) {
    //   // Only proceed if cmInstance.current and the document state exists
    //   cmInstance.current.dispatch({
    //     changes: {
    //       from: 0,
    //       to: cmInstance.current.state?.doc?.length || 0, // Safely access doc length
    //       insert: file.content || '' // Ensure content is not undefined
    //     }
    //   });
    // } else if (docs.current[file.id]) {
    //   cmInstance.current = new EditorView({
    //     state: docs.current[file.id], // Use the stored state
    //     parent: document.querySelector('#editor') // Ensure the correct parent element
    //   });
    // }
  }, [files, file.id]);

  useEffect(() => {
    const startState = EditorState.create({
      doc: file.content,
      options: {
        lineNumbers,
        styleActiveLine: true,
        inputStyle: 'contenteditable',
        lineWrapping: linewrap,
        fixedGutter: false,
        foldGutter: true,
        foldOptions: { widget: '\u2026' }, // Ellipsis as the folding widget
        gutters: ['CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
        highlightSelectionMatches: true,
        matchBrackets: true,
        autoCloseBrackets: autocloseBracketsQuotes,
        styleSelectedText: true,
        colorpicker: {
          type: 'sketch',
          mode: 'edit'
        }
      },
      extensions: [
        EditorView.updateListener.of((update) => {
          if (update.changes && editorView) {
            handleEditorChange(update.state.doc.toString(), editorView);
          }
        }),
        javascript(),
        abbreviationTracker(),
        autocompletion(),
        lintGutter(), // Adds the lint gutter for displaying issues
        linter(myLinterFunction), // Use your custom linter here
        keymap.of([
          {
            key: 'Tab',
            run: (_cmInstance) => {
              if (!_cmInstance.dispatch(expandAbbreviation())) return;
              const selection = _cmInstance.state.selection.main.head;
              if (selection.length > 0) {
                _cmInstance.dispatch({ changes: { indentMore: true } });
              } else {
                _cmInstance.dispatch({
                  changes: { insert: ' '.repeat(INDENTATION_AMOUNT) }
                });
              }
            }
          },
          // {
          //   key: 'Enter',
          //   run: emmet.insert
          // },
          // {
          //   key: 'Esc',
          //   run: emmet.resetAbbreviation
          // },
          {
            key: `${metaKey}-Enter`,
            run: () => null
          },
          {
            key: `Shift-${metaKey}-Enter`,
            run: () => null
          },
          {
            key: `${metaKey}-F`,
            run: find // Use the find command here
          },
          {
            key: `Shift-${metaKey}-F`,
            run: debouncedTidyCode // Tidy code with debounce
          },
          {
            key: `${metaKey}-G`,
            run: findPersistentNext // Find next occurrence
          },
          {
            key: `Shift-${metaKey}-G`,
            run: findPersistentPrev // Find previous occurrence
          },
          {
            key: metaKey === 'Ctrl' ? `${metaKey}-H` : `${metaKey}-Option-F`,
            run: replaceCommand // Replace command
          },
          {
            key: `${metaKey}-K`,
            run: (_cmInstMetaKey, event) => {
              _cmInstMetaKey.state.colorpicker.popup_color_picker({
                length: 0
              });
            }
          }
          // {
          //   key: `${metaKey}-.`,
          //   run: emmet.to // Toggle comment functionality
          // }
        ]),
        keymap.of(standardKeymap) // Include default key bindings,
      ]
    });
    const view = new EditorView({
      state: startState,
      parent: cmInstance.current
    });
    setEditorView(view);
  }, []);

  useEffect(() => {
    if (editorView) {
      if (editorView.state) {
        if (runtimeErrorWarningVisible) {
          if (consoleEvents.length > 0) {
            consoleEvents.forEach((consoleEvent) => {
              if (consoleEvent.method === 'error') {
                const errorObj = { stack: consoleEvent.data[0].toString() };
                StackTrace.fromError(errorObj).then((stackLines) => {
                  console.log('expandConsole');
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
                  // editorView.addLineClass(
                  //   line.lineNumber - 1,
                  //   'background',
                  //   'line-runtime-error'
                  // );
                });
              }
            });
          } else {
            for (let i = 0; i < editorView.state.doc.lines; i += 1) {
              // cmInstance.current.removeLineClass(
              //   i,
              //   'background',
              //   'line-runtime-error'
              // );
              removeLineDecoration(editorView, i);
            }
          }
        }

        for (let i = 0; i < editorView.state.doc.lines; i += 1) {
          removeLineDecoration(editorView, i);
          // cmInstance.current.removeLineClass(
          //   i,
          //   'background',
          //   'line-runtime-error'
          // );
        }
      }
    }

    provideController({
      debouncedTidyCode,
      showFind,
      showReplace,
      getContent
    });
  }, [
    runtimeErrorWarningVisible,
    consoleEvents,
    expandConsole,
    file.id,
    setSelectedFile,
    showFind,
    showReplace
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
      {/* <article ref={codemirrorContainer} className={editorHolderClass} /> */}
      <div className={editorHolderClass} ref={cmInstance}></div>
      {/* <CodeMirror
        className={editorHolderClass}
        ref={cmInstance}
        value={file.content}
        // theme={`p5-${theme}`}
        height="100%"
        extensions={[
          javascript(),
          abbreviationTracker(),
          autocompletion(),
          lintGutter(), // Adds the lint gutter for displaying issues
          linter(myLinterFunction), // Use your custom linter here
          keymap.of([
            {
              key: 'Tab',
              run: (_cmInstance) => {
                if (!_cmInstance.dispatch(expandAbbreviation())) return;
                const selection = _cmInstance.state.selection.main.head;
                if (selection.length > 0) {
                  _cmInstance.dispatch({ changes: { indentMore: true } });
                } else {
                  _cmInstance.dispatch({
                    changes: { insert: ' '.repeat(INDENTATION_AMOUNT) }
                  });
                }
              }
            },
            // {
            //   key: 'Enter',
            //   run: emmet.insert
            // },
            // {
            //   key: 'Esc',
            //   run: emmet.resetAbbreviation
            // },
            {
              key: `${metaKey}-Enter`,
              run: () => null
            },
            {
              key: `Shift-${metaKey}-Enter`,
              run: () => null
            },
            {
              key: `${metaKey}-F`,
              run: find // Use the find command here
            },
            {
              key: `Shift-${metaKey}-F`,
              run: debouncedTidyCode // Tidy code with debounce
            },
            {
              key: `${metaKey}-G`,
              run: findPersistentNext // Find next occurrence
            },
            {
              key: `Shift-${metaKey}-G`,
              run: findPersistentPrev // Find previous occurrence
            },
            {
              key: metaKey === 'Ctrl' ? `${metaKey}-H` : `${metaKey}-Option-F`,
              run: replaceCommand // Replace command
            },
            {
              key: `${metaKey}-K`,
              run: (_cmInstMetaKey, event) => {
                _cmInstMetaKey.state.colorpicker.popup_color_picker({
                  length: 0
                });
              }
            }
            // {
            //   key: `${metaKey}-.`,
            //   run: emmet.to // Toggle comment functionality
            // }
          ]),
          keymap.of(standardKeymap) // Include default key bindings
        ]}
        onChange={handleEditorChange}
        onKeyUp={handleKeyUp}
        options={{
          lineNumbers,
          styleActiveLine: true,
          inputStyle: 'contenteditable',
          lineWrapping: linewrap,
          fixedGutter: false,
          foldGutter: true,
          foldOptions: { widget: '\u2026' }, // Ellipsis as the folding widget
          gutters: ['CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
          highlightSelectionMatches: true,
          matchBrackets: true,
          autoCloseBrackets: autocloseBracketsQuotes,
          styleSelectedText: true,
          colorpicker: {
            type: 'sketch',
            mode: 'edit'
          }
        }}
      /> */}
      {file.url ? <AssetPreview url={file.url} name={file.name} /> : null}
      <EditorAccessibility
        lintMessages={lintMessages}
        currentLine={currentLine}
      />
    </section>
    // <MediaQuery minWidth={770}>
    //   {(matches) =>
    //     matches ? (
    //       <section className={editorSectionClass}>
    //         <div className="editor__header">
    //           <button
    //             aria-label={t('Editor.OpenSketchARIA')}
    //             className="sidebar__contract"
    //             onClick={() => {
    //               collapseSidebar();
    //               closeProjectOptions();
    //             }}
    //           >
    //             <LeftArrowIcon focusable="false" aria-hidden="true" />
    //           </button>
    //           <button
    //             aria-label={t('Editor.CloseSketchARIA')}
    //             className="sidebar__expand"
    //             onClick={expandSidebar}
    //           >
    //             <RightArrowIcon focusable="false" aria-hidden="true" />
    //           </button>
    //           <div className="editor__file-name">
    //             <span>
    //               {file.name}
    //               <UnsavedChangesIndicator />
    //             </span>
    //             <Timer />
    //           </div>
    //         </div>
    //         {/* <article ref={codemirrorContainer} className={editorHolderClass} /> */}
    //         <CodeMirror
    //           className={editorHolderClass}
    //           value={file.content}
    //           theme={`p5-${theme}`}
    //           height="100%"
    //           extensions={[
    //             javascript(),
    //             emmet,
    //             autocompletion(),
    //             lintGutter(), // Adds the lint gutter for displaying issues
    //             linter(myLinterFunction), // Use your custom linter here
    //             keymap.of([sublimeKeymap])
    //           ]}
    //           onChange={handleEditorChange}
    //           onKeyUp={handleKeyUp}
    //           options={{
    //             lineNumbers,
    //             styleActiveLine: true,
    //             inputStyle: 'contenteditable',
    //             lineWrapping: linewrap,
    //             fixedGutter: false,
    //             foldGutter: true,
    //             foldOptions: { widget: '\u2026' }, // Ellipsis as the folding widget
    //             gutters: ['CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
    //             keyMap: 'sublime',
    //             highlightSelectionMatches: true,
    //             matchBrackets: true,
    //             autoCloseBrackets: autocloseBracketsQuotes,
    //             styleSelectedText: true,
    //             colorpicker: {
    //               type: 'sketch',
    //               mode: 'edit'
    //             }
    //           }}
    //         />

    //         {file.url ? <AssetPreview url={file.url} name={file.name} /> : null}
    //         <EditorAccessibility
    //           lintMessages={lintMessages}
    //           currentLine={currentLine}
    //         />
    //       </section>
    //     ) : (
    //       <EditorContainer expanded={isExpanded}>
    //         <div>
    //           <IconButton onClick={expandSidebar} icon={FolderIcon} />
    //           <span>
    //             {file.name}
    //             <UnsavedChangesIndicator />
    //           </span>
    //         </div>
    //         <section>
    //           <div className="editor-container">
    //             <CodeMirror
    //               className={editorHolderClass}
    //               value={file.content}
    //               theme={`p5-${theme}`}
    //               height="100%"
    //               extensions={[
    //                 javascript(),
    //                 emmet,
    //                 autocompletion(),
    //                 lintGutter(), // Adds the lint gutter for displaying issues
    //                 linter(myLinterFunction), // Use your custom linter here
    //                 keymap.of([sublimeKeymap])
    //               ]}
    //               onChange={handleEditorChange}
    //               onKeyUp={handleKeyUp}
    //               options={{
    //                 lineNumbers,
    //                 styleActiveLine: true,
    //                 inputStyle: 'contenteditable',
    //                 lineWrapping: linewrap,
    //                 fixedGutter: false,
    //                 foldGutter: true,
    //                 foldOptions: { widget: '\u2026' }, // Ellipsis as the folding widget
    //                 gutters: [
    //                   'CodeMirror-foldgutter',
    //                   'CodeMirror-lint-markers'
    //                 ],
    //                 keyMap: 'sublime',
    //                 highlightSelectionMatches: true,
    //                 matchBrackets: true,
    //                 autoCloseBrackets: autocloseBracketsQuotes,
    //                 styleSelectedText: true,
    //                 colorpicker: {
    //                   type: 'sketch',
    //                   mode: 'edit'
    //                 }
    //               }}
    //             />
    //           </div>
    //           {file.url ? (
    //             <AssetPreview url={file.url} name={file.name} />
    //           ) : null}
    //           <EditorAccessibility
    //             lintMessages={lintMessages}
    //             currentLine={currentLine}
    //           />
    //         </section>
    //       </EditorContainer>
    //     )
    //   }
    // </MediaQuery>
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
