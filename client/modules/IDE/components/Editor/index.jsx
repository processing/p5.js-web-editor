import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo
} from 'react';
import PropTypes from 'prop-types';
import { EditorState } from '@codemirror/state';
import {
  EditorView,
  keymap,
  Decoration,
  highlightActiveLine,
  highlightSpecialChars,
  lineNumbers
} from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { linter, lintGutter } from '@codemirror/lint';
import { standardKeymap } from '@codemirror/commands';

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
  find,
  findNext,
  findPrevious,
  highlightSelectionMatches,
  searchKeymap
} from '@codemirror/search';
import Pickr from '@simonwep/pickr';

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

const Editor = (props) => {
  const {
    file,
    fontSize,
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

  const [currentLine, setCurrentLine] = useState(1);

  const replaceCommand =
    metaKey === 'Ctrl' ? `${metaKey}-H` : `${metaKey}-Option-F`;

  // Handle document changes (debounced)
  const handleEditorChange = useCallback(() => {
    setUnsavedChanges(true);
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

  const tidyCode = useCallback(() => {
    const mode = getFileMode(file.name);
    if (mode === 'javascript') {
      prettierFormatWithCursor(viewRef.current, 'babel', [babelParser]);
    } else if (mode === 'css') {
      prettierFormatWithCursor(viewRef.current, 'css', [cssParser]);
    } else if (mode === 'htmlmixed') {
      prettierFormatWithCursor(viewRef.current, 'html', [htmlParser]);
    }
  }, [file]);

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

  // Initialize Pickr color picker
  const initColorPicker = () => {
    const pickr = Pickr.create({
      el: '#color-picker', // ID for color picker container
      theme: 'nano', // Color picker theme (can be adjusted)
      components: {
        // Define components of the color picker
        preview: true,
        opacity: true,
        hue: true,
        interaction: {
          hex: true,
          rgba: true,
          hsla: true,
          input: true,
          clear: true,
          save: true
        }
      }
    });

    // Listen for color changes
    pickr.on('save', (color) => {
      const colorHex = color.toHEXA().toString();
      const view = viewRef.current;

      // Insert the color value at the cursor position
      if (view) {
        view.dispatch({
          changes: { from: view.state.selection.main.head, insert: colorHex }
        });
      }
    });

    pickrRef.current = pickr;
  };

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

  // Open the color picker when `MetaKey + K` is pressed
  const openColorPicker = () => {
    if (pickrRef.current) {
      pickrRef.current.show(); // Show the color picker programmatically
    }
  };

  const triggerFindPersistent = () => {
    const view = viewRef.current;
    if (view) {
      view.dispatch({ effects: find.of('') }); // Dispatch the find effect
    }
  };

  const customKeymap = [
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
    // {
    //   key: 'Enter',
    //   run: emmetInsert, // Run Emmet insert on Enter key
    // },
    // {
    //   key: 'Esc',
    //   run: resetAbbreviation, // Reset Emmet abbreviation on Esc key
    // },
    {
      key: `${metaKey}-Enter`,
      run: () => null // No action, handle meta + Enter
    },
    {
      key: `Shift-${metaKey}-Enter`,
      run: () => null // No action, handle shift + meta + Enter
    },
    {
      key: `${metaKey}-F`, // Meta + F to trigger findPersistent
      run: () => {
        triggerFindPersistent(); // Trigger the findPersistent functionality
        return true; // Prevent default behavior
      }
    },
    {
      key: `Shift-${metaKey}-F`,
      run: tidyCode // Debounced tidy code
    },
    {
      key: `${metaKey}-G`,
      run: findNext
    },
    {
      key: `Shift-${metaKey}-G`,
      run: findPrevious
    },
    {
      key: metaKey === 'Ctrl' ? `${metaKey}-H` : `${metaKey}-Option-F`,
      run: replaceCommand
    },
    {
      key: `${metaKey}-K`, // Meta + K to trigger color picker
      run: () => {
        openColorPicker(); // Trigger the color picker
        return true; // Prevent default behavior
      }
    },
    ...standardKeymap // Default key bindings from CodeMirror
  ];

  let focusedLinkElement = null;

  useEffect(() => {
    if (!editorRef.current) return;

    initColorPicker();

    const setFocusedLinkElement = (set) => {
      if (set && !focusedLinkElement) {
        const activeItemLink = document.querySelector(
          '.cm-tooltip-autocomplete a'
        );
        if (activeItemLink) {
          focusedLinkElement = activeItemLink;
          focusedLinkElement.classList.add('focused-hint-link');
          activeItemLink.parentElement?.parentElement?.classList.add(
            'unfocused'
          );
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

      const hints = hinter
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

    // const updateContentDebounced = lodashDebounce(() => {
    //   setUnsavedChanges(true);
    //   hideRuntimeErrorWarning();
    //   if (view) {
    //     const content = view.state.doc.toString();
    //     updateFileContent(file.id, content);
    //     if (autorefresh && isPlaying) {
    //       clearConsole();
    //       startSketch();
    //     }
    //   }
    // }, 1000);

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
          // Move focus manually here if needed
          setFocusedLinkElement(onLink);
          return true;
        },
        Down: () => {
          const onLink = removeFocusedLinkElement();
          // Move focus manually here if needed
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

    const startState = EditorState.create({
      doc: file.content,
      extensions: [
        javascript(),
        autocompletion(),
        linter(myLinterFunction), // Linter extension placeholder
        lintGutter(),
        abbreviationTracker(),
        lineNumbers(), // Line numbers
        highlightActiveLine(), // Highlight active line
        EditorView.lineWrapping, // Line wrapping
        foldGutter(), // Fold gutter
        bracketMatching(), // Match brackets
        closeBrackets(), // Automatically close brackets
        highlightSelectionMatches(), // Highlight search matches
        css(),
        hintExtension,
        keymap.of(customKeymap),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            handleEditorChange(); // Ensure changes are handled properly
          }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });
    viewRef.current = view;

    const showHint = () => {
      if (view) {
        // Trigger hinting manually if needed; CM6 autocompletion happens automatically with the proper extensions
        view.dispatch({
          effects: autocompletion.startCompletion.of({
            source: javascriptCompletion
          })
        });
      }
    };

    const onKeyDown = (e) => {
      const mode = view?.state.facet(EditorState.languageDataAt)?.[0];
      if (/^[a-z]$/i.test(e.key) && (mode === 'css' || mode === 'javascript')) {
        showHint();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.target.blur();
      }
    };

    view.dom.style.fontSize = `${fontSize}px`; // Apply font size

    // Attach keydown handler
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
  }, []);

  return (
    <section
      className={classNames('editor', { 'sidebar--contracted': !isExpanded })}
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
  );
};

Editor.propTypes = {
  // autocloseBracketsQuotes: PropTypes.bool.isRequired,
  autocompleteHinter: PropTypes.bool.isRequired,
  // lineNumbers: PropTypes.bool.isRequired,
  lintWarning: PropTypes.bool.isRequired,
  // linewrap: PropTypes.bool.isRequired,
  lintMessages: PropTypes.arrayOf(
    PropTypes.shape({
      severity: PropTypes.oneOf(['error', 'hint', 'info', 'warning'])
        .isRequired,
      line: PropTypes.number.isRequired,
      message: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired
    })
  ).isRequired,
  // consoleEvents: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     method: PropTypes.string.isRequired,
  //     args: PropTypes.arrayOf(PropTypes.string)
  //   })
  // ).isRequired,
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
  // theme: PropTypes.string.isRequired,
  // unsavedChanges: PropTypes.bool.isRequired,
  // files: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     id: PropTypes.string.isRequired,
  //     name: PropTypes.string.isRequired,
  //     content: PropTypes.string.isRequired
  //   })
  // ).isRequired,
  isExpanded: PropTypes.bool.isRequired,
  collapseSidebar: PropTypes.func.isRequired,
  // closeProjectOptions: PropTypes.func.isRequired,
  expandSidebar: PropTypes.func.isRequired,
  clearConsole: PropTypes.func.isRequired,
  // hideRuntimeErrorWarning: PropTypes.func.isRequired,
  // runtimeErrorWarningVisible: PropTypes.bool.isRequired,
  provideController: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
  // setSelectedFile: PropTypes.func.isRequired,
  // expandConsole: PropTypes.func.isRequired
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
