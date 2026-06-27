import { useRef, useEffect } from 'react';
import { EditorView, lineNumbers as lineNumbersExt } from '@codemirror/view';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { debounce } from 'lodash';
import { openSearchPanel } from '@codemirror/search';
import { saveLocalBackup } from '../../utils/localBackup';
import { p5JavaScript } from './utils/p5JavaScript';

import {
  getFileMode,
  createNewFileState,
  updateFileStates
} from './utils/fileState';
import { createAutocompleteOptions } from './utils/extensionCustomStyles';
import { useEffectWithComparison } from '../../hooks/custom-hooks';
import { tidyCodeWithPrettier } from './utils/tidier';

// ----- GENERAL TODOS (in order of priority) -----
// - revisit keymap differences, esp around sublime
// - emmet doesn't trigger if text is copy pasted in
// - need to re-implement emmet auto rename tag
// - clike addon

/** This is a custom React hook that manages CodeMirror state. */
export default function useCodeMirror({
  project,
  lineNumbers,
  linewrap,
  autocloseBracketsQuotes,
  setUnsavedChanges,
  setCurrentLine,
  updateFileContent,
  file,
  files,
  autorefresh,
  clearConsole,
  startSketch,
  autocompleteHinter,
  fontSize,
  onUpdateLinting,
  referenceBaseUrl,
  p5Version
}) {
  // The codemirror instance.
  const cmView = useRef();
  // The current codemirror files.
  const fileStates = useRef();

  // We store values used by the debounced onChange callback in a ref.
  // Otherwise it can hold onto stale React state
  const onChangeStateRef = useRef({});
  onChangeStateRef.current = {
    fileId: file.id,
    autorefresh,
    project,
    files
  };

  // When the file changes, update the file content and save status.
  function onChange() {
    const state = onChangeStateRef.current;

    setUnsavedChanges(true);
    updateFileContent(state.fileId, cmView.current.state.doc.toString());

    // Save a local backup to localStorage for crash recovery (#3891).
    // This ensures work is recoverable even if the tab crashes
    // (e.g. from an infinite loop) before the server autosave fires.
    const projectId = state.project?.id || 'unsaved';
    saveLocalBackup(projectId, state.files);

    if (state.autorefresh) {
      clearConsole();
      startSketch();
    }
  }
  // Call onChange at most once every second.
  const debouncedOnChange = debounce(onChange, 1000);

  // This is called when the CM view updates.
  function onViewUpdate(updateView) {
    const { state } = updateView;

    // TODO - check if need to subtract one
    setCurrentLine(state.doc.lineAt(state.selection.main.head).number);

    if (updateView.docChanged) {
      debouncedOnChange();
    }
  }

  // When the container component enters the DOM, we want this function
  // to be called so we can setup the CodeMirror instance with the container.
  function setupCodeMirrorOnContainerMounted(container) {
    cmView.current = new EditorView({
      parent: container
    });
  }

  //  When the component unmounts, we want to clean up the CodeMirror instance.
  function teardownCodeMirror() {
    if (cmView.current) {
      cmView.current.destroy();
      cmView.current = null;
    }
  }

  // When settings change, we pass those changes into CodeMirror.
  useEffect(() => {
    const reconfigureEffect = (fileState) =>
      fileState.fontSizeCpt.reconfigure(
        EditorView.theme({ '&': { fontSize: `${fontSize}px` } })
      );
    updateFileStates({
      fileStates: fileStates.current,
      cmView: cmView.current,
      file,
      reconfigureEffect
    });
  }, [fontSize]);
  useEffect(() => {
    const reconfigureEffect = (fileState) =>
      fileState.lineWrappingCpt.reconfigure(
        linewrap ? EditorView.lineWrapping : []
      );
    updateFileStates({
      fileStates: fileStates.current,
      cmView: cmView.current,
      file,
      reconfigureEffect
    });
  }, [linewrap]);
  useEffect(() => {
    const reconfigureEffect = (fileState) =>
      fileState.lineNumbersCpt.reconfigure(lineNumbers ? lineNumbersExt() : []);
    updateFileStates({
      fileStates: fileStates.current,
      cmView: cmView.current,
      file,
      reconfigureEffect
    });
  }, [lineNumbers]);
  useEffect(() => {
    const reconfigureEffect = (fileState) =>
      fileState.closeBracketsCpt.reconfigure(
        autocloseBracketsQuotes ? closeBrackets() : []
      );
    updateFileStates({
      fileStates: fileStates.current,
      cmView: cmView.current,
      file,
      reconfigureEffect
    });
  }, [autocloseBracketsQuotes]);
  useEffect(() => {
    const reconfigureEffect = (fileState) =>
      fileState.autocompleteCpt.reconfigure(
        autocompleteHinter
          ? autocompletion(createAutocompleteOptions(referenceBaseUrl))
          : []
      );
    updateFileStates({
      fileStates: fileStates.current,
      cmView: cmView.current,
      file,
      reconfigureEffect
    });
  }, [autocompleteHinter, referenceBaseUrl]);
  useEffect(() => {
    const reconfigureEffect = (fileState) =>
      fileState.languageCpt.reconfigure(
        p5Version ? p5JavaScript(p5Version) : []
      );

    updateFileStates({
      fileStates: fileStates.current,
      cmView: cmView.current,
      file,
      reconfigureEffect
    });
  }, [p5Version]);

  // Initializes the files as CodeMirror states.
  function initializeDocuments() {
    if (!fileStates.current) {
      fileStates.current = {};
    }

    files.forEach((currentFile) => {
      if (
        currentFile.name !== 'root' &&
        !(currentFile.id in fileStates.current)
      ) {
        fileStates.current[currentFile.id] = createNewFileState(
          currentFile.name,
          currentFile.content,
          {
            linewrap,
            lineNumbers,
            autocloseBracketsQuotes,
            autocomplete: autocompleteHinter,
            onUpdateLinting,
            onViewUpdate,
            referenceBaseUrl,
            fontSize,
            p5Version
          }
        );
      }
    });
  }

  // When the files change, reinitialize the documents.
  useEffect(initializeDocuments, [files]);

  // When the file changes, make the CodeMirror call to swap out the document.
  useEffectWithComparison(
    (_, prevProps) => {
      // We need to save the previous CodeMirror state so we can restore it
      // when we switch back to it.
      const previousState = cmView.current.state;
      if (Array.isArray(prevProps) && prevProps.length > 0 && previousState) {
        const prevId = prevProps[0];
        fileStates.current[prevId].cmState = previousState;
      }

      const { cmState } = fileStates.current[file.id];
      cmView.current.setState(cmState);
    },
    [file.id]
  );

  const getContent = () => {
    const content = cmView.current.state.doc.toString();
    const updatedFile = Object.assign({}, file, { content });
    return updatedFile;
  };

  const showSearch = () => {
    openSearchPanel(cmView.current);
  };

  const tidyCode = () => {
    const fileMode = getFileMode(file.name);
    tidyCodeWithPrettier(cmView.current, fileMode);
  };

  const updateEditorFileContent = (id, src) => {
    const fileState = fileStates.current?.[id];

    if (!fileState) return;

    fileState.cmState = fileState.cmState.update({
      changes: {
        from: 0,
        to: fileState.cmState.doc.length,
        insert: src
      }
    }).state;

    if (id === file.id) {
      cmView.current.setState(fileState.cmState);
    }
  };

  return {
    setupCodeMirrorOnContainerMounted,
    teardownCodeMirror,
    getContent,
    tidyCode,
    showSearch,
    updateEditorFileContent,
    codemirrorView: cmView
  };
}
