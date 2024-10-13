import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo
} from 'react';
import PropTypes from 'prop-types';
import { EditorState, StateEffect, Prec, StateField } from '@codemirror/state';
import {
  EditorView,
  keymap,
  highlightActiveLine,
  lineNumbers,
  Decoration,
  DecorationSet
} from '@codemirror/view';
import Fuse from 'fuse.js';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { bracketMatching, foldGutter } from '@codemirror/language';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { linter, lintGutter } from '@codemirror/lint';
import { standardKeymap } from '@codemirror/commands';
import {
  colorPicker,
  wrapperClassName
} from '@replit/codemirror-css-color-picker';
import MediaQuery from 'react-responsive';
import prettier from 'prettier/standalone';
import babelParser from 'prettier/parser-babel';
import htmlParser from 'prettier/parser-html';
import cssParser from 'prettier/parser-postcss';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import { JSHINT } from 'jshint';
import { CSSLint } from 'csslint';
import { HTMLHint } from 'htmlhint';

import {
  expandAbbreviation,
  abbreviationTracker,
  insert as emmetInsert,
  resetAbbreviation
} from '@emmetio/codemirror6-plugin';
import {
  findNext,
  findPrevious,
  highlightSelectionMatches
} from '@codemirror/search';

import classNames from 'classnames';
import StackTrace from 'stacktrace-js';
import beepUrl from '../../../../sounds/audioAlert.mp3';
import RightArrowIcon from '../../../../images/right-arrow.svg';
import LeftArrowIcon from '../../../../images/left-arrow.svg';
import { metaKey } from '../../../../utils/metaKey';
import * as hinter from '../../../../utils/p5-hinter';
import AssetPreview from '../AssetPreview';
import Timer from '../Timer';
import EditorAccessibility from '../EditorAccessibility';
import UnsavedChangesIndicator from '../UnsavedChangesIndicator';
import { getHTMLFile } from '../../reducers/files';
import { selectActiveFile } from '../../selectors/files';
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

const INDENTATION_AMOUNT = 2;

window.JSHINT = JSHINT;
window.CSSLint = CSSLint;
window.HTMLHint = HTMLHint;

const getFileMode = (fileName) => {
  if (fileName.match(/.+\.js$/i)) return 'javascript';
  if (fileName.match(/.+\.css$/i)) return 'css';
  if (fileName.match(/.+\.(html|xml)$/i)) return 'htmlmixed';
  return 'text/plain';
};

const prettierFormatWithCursor = (view, parser, plugins) => {
  try {
    const { formatted, cursorOffset } = prettier.formatWithCursor(
      view.state.doc.toString(),
      {
        cursorOffset: view.state.selection.main.head,
        parser,
        plugins
      }
    );
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: formatted },
      selection: { anchor: cursorOffset }
    });
    view.focus();
  } catch (error) {
    console.error(error);
  }
};

const createThemeExtension = (themeName) => {
  const themeClass = themeName === 'dark' ? 'cm-s-p5-dark' : 'cm-s-p5-light';
  return EditorView.theme({}, { dark: themeName === 'dark', themeClass });
};

// Create an effect to add or remove decorations
const addDecorationEffect = StateEffect.define();
const removeDecorationEffect = StateEffect.define();

// Define a StateField to manage decorations
const decorationsField =
  StateField.define <
  DecorationSet >
  {
    create() {
      return Decoration.none;
    },
    update(decorations, tr) {
      let newDecorations = decorations; // Create a new variable to hold the updated decorations

      tr.effects.forEach((effect) => {
        if (effect.is(addDecorationEffect)) {
          newDecorations = newDecorations.update({ add: [effect.value] });
        }
        if (effect.is(removeDecorationEffect)) {
          newDecorations = Decoration.none;
        }
      });

      return newDecorations; // Return the new variable instead of reassigning the parameter
    },
    provide: (f) => EditorView.decorations.from(f)
  };

const Editor = (props) => {
  const {
    file,
    fontSize,
    unsavedChanges,
    setUnsavedChanges,
    updateFileContent,
    autorefresh,
    isPlaying,
    clearConsole,
    startSketch,
    provideController,
    isExpanded,
    t,
    collapseSidebar,
    expandSidebar,
    lintMessages,
    clearLintMessage,
    updateLintMessage,
    lintWarning,
    theme,
    hideRuntimeErrorWarning,
    files,
    setSelectedFile,
    expandConsole,
    runtimeErrorWarningVisible,
    consoleEvents,
    autocompleteHinter
  } = props;

  const beepRef = useRef(null);

  useEffect(() => {
    beepRef.current = new Audio(beepUrl);

    return () => {
      beepRef.current = null;
    };
  }, [beepUrl]);

  const updateLintingMessageAccessibility = useCallback(
    debounce((annotations) => {
      clearLintMessage();
      annotations.forEach((x) => {
        if (x.from.line > -1) {
          updateLintMessage(x.severity, x.from.line + 1, x.message);
        }
      });
      if (lintMessages.length > 0 && lintWarning) {
        beepRef.current.play();
      }
    }, 2000),
    []
  );

  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const pickrRef = useRef(null);
  const fuseRef = useRef(null); // Store the Fuse instance in a ref
  const docsRef = useRef({}); // Store the documents in a ref
  const prevFileIdRef = useRef(null); // Store the previous file ID in a ref

  useEffect(() => {
    // Initialize the Fuse instance only when `hinter` changes
    if (hinter && hinter.p5Hinter) {
      fuseRef.current = new Fuse(hinter.p5Hinter, {
        threshold: 0.05, // Set your threshold
        keys: ['text'] // Keys to search against
      });
    }
  }, [hinter]);

  const [currentLine, setCurrentLine] = useState(1);

  const replaceCommand = metaKey === 'Ctrl' ? `Mod-h` : `Mod-Alt-f`;

  // Handle document changes (debounced)
  const handleEditorChange = useCallback(() => {
    setUnsavedChanges(true);
    hideRuntimeErrorWarning();
    updateFileContent(file.id, viewRef.current.state.doc.toString());
    if (autorefresh && isPlaying) {
      clearConsole();
      startSketch();
    }
  }, [
    setUnsavedChanges,
    updateFileContent,
    file.id,
    autorefresh,
    isPlaying,
    clearConsole,
    startSketch
  ]);

  const tidyCode = () => {
    const mode = getFileMode(file.name);
    if (mode === 'javascript') {
      prettierFormatWithCursor(viewRef.current, 'babel', [babelParser]);
    } else if (mode === 'css') {
      prettierFormatWithCursor(viewRef.current, 'css', [cssParser]);
    } else if (mode === 'htmlmixed') {
      prettierFormatWithCursor(viewRef.current, 'html', [htmlParser]);
    }
  };

  const showFind = useCallback(() => {
    viewRef.current.dispatch({ effect: EditorView.findPersistent.of() });
  }, []);

  const showReplace = useCallback(() => {
    viewRef.current.dispatch({ effect: EditorView.replacePersistent.of() });
  }, []);

  const getContent = useCallback(
    () => viewRef.current.state.doc.toString(),
    []
  );

  const handleKeyUp = useCallback(() => {
    const lineNumber = viewRef.current.state.doc.lineAt(
      viewRef.current.state.selection.main.head
    ).number;
    setCurrentLine(lineNumber);
  }, []);

  const customLinterFunction = (view) => {
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

  const triggerFindPersistent = () => {
    const view = viewRef.current;
    if (view) {
      // TODO: fix this use persistent using codemirror search
      view.dispatch({ effects: findNext }); // Dispatch the find effect
    }
  };

  const customKeymap = keymap.of([
    {
      key: 'Tab',
      run: (view) => {
        if (!view.dispatch(expandAbbreviation())) return;
        const selection = view.state.selection.main.head;
        if (selection.length > 0) {
          view.dispatch({ changes: { indentMore: true } });
        } else {
          view.dispatch({
            changes: { insert: ' '.repeat(INDENTATION_AMOUNT) }
          });
        }
      }
    },
    // TODO: test emmet
    // {
    //   key: 'Enter',
    //   run: emmetInsert, // Run Emmet insert on Enter key
    // },
    // {
    //   key: 'Esc',
    //   run: resetAbbreviation, // Reset Emmet abbreviation on Esc key
    // },
    {
      key: `Mod-Enter`,
      run: () => {} // No action, handle meta + Enter
    },
    {
      key: `Shift-Mod-Enter`,
      run: () => null // No action, handle shift + meta + Enter
    },
    {
      key: `Mod-f`, // Meta + F to trigger findPersistent
      run: () => {
        triggerFindPersistent(); // Trigger the findPersistent functionality
        return true; // Prevent default behavior
      }
    },
    {
      key: `Mod-F`,
      run: tidyCode
    },
    {
      key: `Mod-g`,
      run: findNext
    },
    {
      key: `Mod-G`,
      run: findPrevious
    },
    {
      key: metaKey === 'Ctrl' ? `Mod-h` : `Mod-Alt-f`,
      run: replaceCommand
    },
    {
      key: `Mod-k`, // TODO: need to find a way to create custom color picker since codemirror 6 doesn't have one
      run: () => null
    }
  ]);

  let focusedLinkElement = null;

  const setFocusedLinkElement = (set) => {
    if (set && !focusedLinkElement) {
      const activeItemLink = document.querySelector(
        '.cm-tooltip-autocomplete a'
      );
      if (activeItemLink) {
        focusedLinkElement = activeItemLink;
        focusedLinkElement.classList.add('focused-hint-link');
        activeItemLink.parentElement?.parentElement?.classList.add('unfocused');
      }
    }
  };

  const removeFocusedLinkElement = () => {
    if (focusedLinkElement) {
      focusedLinkElement.classList.remove('focused-hint-link');
      focusedLinkElement.parentElement?.parentElement?.classList.remove(
        'unfocused'
      );
      focusedLinkElement = null;
      return true;
    }
    return false;
  };

  const javascriptCompletion = (context) => {
    const token = context.matchBefore(/\w*/);
    if (!token) return null;

    const hints = fuseRef.current
      .search(token.text)
      .filter((h) => h.item.text[0] === token.text[0]);

    return {
      from: token.from,
      options: hints.map((h) => ({
        label: h.item.text,
        apply: h.item.text
      }))
    };
  };

  const hintExtension = autocompletion({
    override: [javascriptCompletion], // Use the javascript completion we defined earlier
    closeOnUnfocus: false,
    extraKeys: {
      'Shift-Right': () => {
        const activeItemLink = document.querySelector(
          '.cm-tooltip-autocomplete a'
        );
        if (activeItemLink) activeItemLink.click();
        return true;
      },
      Right: () => {
        setFocusedLinkElement(true);
        return true;
      },
      Left: () => {
        removeFocusedLinkElement();
        return true;
      },
      Up: () => {
        const onLink = removeFocusedLinkElement();
        setFocusedLinkElement(onLink);
        return true;
      },
      Down: () => {
        const onLink = removeFocusedLinkElement();
        setFocusedLinkElement(onLink);
        return true;
      },
      Enter: () => {
        if (focusedLinkElement) {
          focusedLinkElement.click();
          return true;
        }
        return false;
      }
    }
  });

  const getCommonExtensions = () => [
    javascript(),
    autocompletion(),
    linter(customLinterFunction), // Linter extension
    lintGutter(),
    abbreviationTracker(),
    lineNumbers(), // Line numbers
    highlightActiveLine(), // Highlight active line
    foldGutter(), // Fold gutter
    bracketMatching(), // Match brackets
    closeBrackets(), // Automatically close brackets
    highlightSelectionMatches(), // Highlight search matches
    css(), // CSS support
    keymap.of(standardKeymap),
    Prec.highest(customKeymap), // Ensure custom keymap has the highest precedence
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        handleEditorChange(); // Handle document changes
      }
    }),
    EditorView.updateListener.of((update) => {
      if (update.domEvent && update.domEvent.type === 'keyup') {
        handleKeyUp(update.domEvent);
      }
    }),
    EditorView.lineWrapping,
    hintExtension,
    // colorPicker,
    EditorView.theme({
      [`.${wrapperClassName}`]: {
        outlineColor: 'transparent'
      }
    })
    // decorationsField
  ];

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: file.content,
      extensions: [...getCommonExtensions(), createThemeExtension(theme)]
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });
    viewRef.current = view;

    const showHint = () => {
      if (view) {
        view.dispatch({
          effects: autocompletion.startCompletion.of({
            source: javascriptCompletion
          })
        });
      }
    };

    const onKeyDown = (e) => {
      const mode = view?.state.facet(EditorState.languageData)?.[0];
      if (/^[a-z]$/i.test(e.key) && (mode === 'css' || mode === 'javascript')) {
        showHint();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.target.blur();
      }
    };

    view.dom.style.fontSize = `${fontSize}px`;

    view.dom.addEventListener('keydown', onKeyDown);

    provideController({
      tidyCode,
      showFind,
      showReplace,
      getContent
    });

    // eslint-disable-next-line consistent-return
    return () => {
      view.dom.removeEventListener('keydown', onKeyDown);
      view.destroy();
    };
  }, [fuseRef, pickrRef]);

  const prevConsoleEventsLengthRef = useRef(consoleEvents.length);
  const errorDecoration = useRef([]);

  // Effect to handle runtime error highlighting
  useEffect(() => {
    if (runtimeErrorWarningVisible) {
      const prevConsoleEventsLength = prevConsoleEventsLengthRef.current;

      if (consoleEvents.length !== prevConsoleEventsLength) {
        // Process new console events
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
              if (fileWithError) {
                setSelectedFile(fileWithError.id);

                // Create a line decoration for the error
                const decoration = Decoration.line({
                  class: 'line-runtime-error'
                }).range(
                  viewRef.current.state.doc.line(line.lineNumber - 1).from
                );

                // Apply the decoration to highlight the line
                viewRef.current.dispatch({
                  effects: StateEffect.appendConfig.of(
                    EditorView.decorations.of(Decoration.set([decoration]))
                  )
                });

                // Store the decoration so it can be cleared later
                errorDecoration.current = Decoration.set([decoration]);
              }
            });
          }
        });
      } else if (errorDecoration.current) {
        viewRef.current.dispatch({
          effects: StateEffect.appendConfig.of(
            EditorView.decorations.of(Decoration.none)
          )
        });
        errorDecoration.current = Decoration.none; // Clear the stored decorations
      }

      prevConsoleEventsLengthRef.current = consoleEvents.length;
    }
  }, [
    runtimeErrorWarningVisible,
    consoleEvents,
    files,
    expandConsole,
    setSelectedFile,
    viewRef
  ]);

  // Handle file changes
  useEffect(() => {
    if (!viewRef.current) return;

    const view = viewRef.current;
    const prevFileId = prevFileIdRef.current;

    docsRef.current[prevFileId] = view.state.doc;

    const newDoc =
      docsRef.current[file.id] || EditorState.create({ doc: file.content }).doc;

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: newDoc.toString() }
    });

    view.focus();

    prevFileIdRef.current = file.id;
  }, [file.id]);

  // Handle unsaved changes
  useEffect(() => {
    if (!viewRef.current) return;

    if (!unsavedChanges) {
      setTimeout(() => setUnsavedChanges(false), 400);
    }
  }, [unsavedChanges]);

  // Handle theme change
  useEffect(() => {
    if (!viewRef.current) return;

    const view = viewRef.current;
    const newTheme = createThemeExtension(theme);

    view.dispatch({
      effects: StateEffect.reconfigure.of([...getCommonExtensions(), newTheme])
    });
  }, [props.file.content, theme]);

  return (
    <MediaQuery minWidth={770}>
      {(matches) =>
        matches ? (
          <section
            className={classNames('editor', {
              'sidebar--contracted': !isExpanded
            })}
          >
            <div className="editor__header">
              <button
                aria-label={t('Editor.OpenSketchARIA')}
                className="sidebar__contract"
                onClick={collapseSidebar}
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
            <div
              ref={editorRef}
              className={classNames('editor-holder', {
                'editor-holder--hidden': file.fileType === 'folder' || file.url
              })}
            />
            <div id="color-picker" />
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
              <EditorHolder ref={editorRef} />
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
  // autocloseBracketsQuotes: PropTypes.bool.isRequired,
  autocompleteHinter: PropTypes.bool.isRequired,
  lintWarning: PropTypes.bool.isRequired,
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
  // closeProjectOptions: PropTypes.func.isRequired,
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
