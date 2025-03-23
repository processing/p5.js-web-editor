import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import StackTrace from 'stacktrace-js';

import classNames from 'classnames';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import MediaQuery from 'react-responsive';
import '../../../../utils/htmlmixed';
import '../../../../utils/p5-javascript';
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

import { hideHinter } from './hinter';
import tidyCode from './tidier';
import useCodeMirror from './codemirror';
import { useEffectWithComparison } from '../../hooks/custom-hooks';

function Editor({
  provideController,
  files,
  file,
  theme,
  linewrap,
  lineNumbers,
  closeProjectOptions,
  setSelectedFile,
  setUnsavedChanges,
  lintMessages,
  lintWarning,
  clearLintMessage,
  updateLintMessage,
  updateFileContent,
  autorefresh,
  isPlaying,
  clearConsole,
  startSketch,
  autocompleteHinter,
  autocloseBracketsQuotes,
  fontSize,
  consoleEvents,
  hideRuntimeErrorWarning,
  runtimeErrorWarningVisible,
  expandConsole,
  isExpanded,
  t,
  collapseSidebar,
  expandSidebar
}) {
  const [currentLine, setCurrentLine] = useState(1);
  const beep = useRef();

  const updateLintingMessageAccessibility = debounce((annotations) => {
    clearLintMessage();
    annotations.forEach((x) => {
      if (x.from.line > -1) {
        updateLintMessage(x.severity, x.from.line + 1, x.message);
      }
    });
    if (lintMessages.length > 0 && lintWarning) {
      beep.play();
    }
  }, 2000);

  // The useCodeMirror hook manages CodeMirror state and returns
  // a reference to the actual CM instance.
  const {
    setupCodeMirrorOnContainerMounted,
    teardownCodeMirror,
    cmInstance,
    getContent,
    showFind,
    showReplace
  } = useCodeMirror({
    theme,
    lineNumbers,
    linewrap,
    autocloseBracketsQuotes,
    setUnsavedChanges,
    hideRuntimeErrorWarning,
    updateFileContent,
    file,
    files,
    autorefresh,
    isPlaying,
    clearConsole,
    startSketch,
    autocompleteHinter,
    fontSize,
    updateLintingMessageAccessibility,
    setCurrentLine
  });

  // Lets the parent component access file content-specific functionality...
  // TODO(connie) - Revisit the logic here, can we wrap this in useCallback or something?
  provideController({
    tidyCode: () => tidyCode(cmInstance.current),
    showFind,
    showReplace,
    getContent
  });

  // When the CM container div mounts, we set up CodeMirror.
  const onContainerMounted = useCallback(setupCodeMirrorOnContainerMounted, []);

  // This is acting as a "componentDidMount" call where it runs once
  // at the start and never again. It also provides a cleanup function.
  useEffect(() => {
    beep.current = new Audio(beepUrl);

    provideController({
      tidyCode: () => tidyCode(cmInstance.current),
      showFind,
      showReplace,
      getContent
    });

    return () => {
      provideController(null);
      teardownCodeMirror();
    };
  }, []);

  useEffect(() => {
    // close the hinter window once the preference is turned off
    if (!autocompleteHinter) hideHinter(cmInstance.current);
  }, [autocompleteHinter]);

  // TODO: Should this be watching more deps?
  useEffectWithComparison(
    (_, prevProps) => {
      if (runtimeErrorWarningVisible) {
        if (consoleEvents.length !== prevProps.consoleEvents.length) {
          consoleEvents.forEach((consoleEvent) => {
            if (consoleEvent.method === 'error') {
              // It doesn't work if you create a new Error, but this works
              // LOL
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
    },
    [consoleEvents, runtimeErrorWarningVisible]
  );

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
            <article ref={onContainerMounted} className={editorHolderClass} />
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
              <EditorHolder
                ref={(element) => {
                  this.codemirrorContainer = element;
                }}
              />
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
