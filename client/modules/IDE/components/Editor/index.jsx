import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import StackTrace from 'stacktrace-js';

import classNames from 'classnames';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import MediaQuery from 'react-responsive';

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
import { IconButton } from '../../../../common/IconButton';
import { saveLocalBackup } from '../../utils/localBackup';

import useCodeMirror from './codemirror';

import {
  addErrorDecoration,
  removeErrorDecorations
} from './consoleErrorDecoration';

// temporary until p5.js 2.0 becomes default
// checks if sketch is using p5.js 2.0 to pass correct base url for autocomplete hinter reference
export function getReferenceBaseUrl(htmlFile) {
  const html = htmlFile?.content || '';

  const isV2 =
    /https:\/\/beta\.p5js\.org\b/i.test(html) || /\bp5(@|-)2\./i.test(html);

  return isV2 ? 'https://beta.p5js.org' : 'https://p5js.org';
}

function Editor({
  provideController,
  files,
  file,
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
  clearConsole,
  startSketch,
  autocompleteHinter,
  autocloseBracketsQuotes,
  fontSize,
  consoleEvents,
  expandConsole,
  isExpanded,
  htmlFile,
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
    codemirrorView,
    getContent,
    tidyCode,
    showSearch
  } = useCodeMirror({
    lineNumbers,
    linewrap,
    autocloseBracketsQuotes,
    setUnsavedChanges,
    updateFileContent,
    file,
    files,
    autorefresh,
    clearConsole,
    startSketch,
    autocompleteHinter,
    fontSize,
    updateLintingMessageAccessibility,
    setCurrentLine,
    referenceBaseUrl: getReferenceBaseUrl(htmlFile)
  });

  // Lets the parent component access file content-specific functionality...
  useEffect(() => {
    provideController({
      tidyCode,
      getContent,
      showSearch
    });
  }, [getContent]);

  // When the CM container div mounts, we set up CodeMirror.
  const onContainerMounted = useCallback(setupCodeMirrorOnContainerMounted, []);

  // This is acting as a "componentDidMount" call where it runs once
  // at the start and never again. It also provides a cleanup function.
  useEffect(() => {
    beep.current = new Audio(beepUrl);

    return () => {
      provideController(null);
      teardownCodeMirror();
    };
  }, []);

  // Updates the runtime error console.
  useEffect(() => {
    const consoleErrors = consoleEvents.filter((e) => e.method === 'error');

    if (consoleErrors.length > 0) {
      const firstError = consoleErrors[0];
      const errorObj = { stack: firstError.data[0].toString() };
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
        addErrorDecoration(codemirrorView.current, line.lineNumber);
      });
    } else {
      removeErrorDecorations(codemirrorView.current);
    }
  }, [consoleEvents]);

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
                aria-label={t('Editor.CloseSketchARIA')}
                className="sidebar__contract"
                onClick={() => {
                  collapseSidebar();
                  closeProjectOptions();
                }}
              >
                <LeftArrowIcon focusable="false" aria-hidden="true" />
              </button>
              <button
                aria-label={t('Editor.OpenSketchARIA')}
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
              <EditorHolder ref={onContainerMounted} />
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
  htmlFile: PropTypes.shape({
    content: PropTypes.string
  }),
  collapseSidebar: PropTypes.func.isRequired,
  closeProjectOptions: PropTypes.func.isRequired,
  expandSidebar: PropTypes.func.isRequired,
  clearConsole: PropTypes.func.isRequired,
  provideController: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  setSelectedFile: PropTypes.func.isRequired,
  expandConsole: PropTypes.func.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string
  })
};

Editor.defaultProps = {
  htmlFile: null,
  project: {}
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
