import PropertyType from 'prop-types';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import CodeMirror from 'codemirror';
import Fuse from 'fuse.js';
import emmet from '@emmetio/codemirror-plugin';
import prettier from 'prettier/standalone';
import babelParser from 'prettier/parser-babel';
import htmlParser from 'prettier/parser-html';
import cssParser from 'prettier/parser-postcss';
import { withTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';
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
import { FolderIcon } from '../../../../common/icons';
import IconButton from '../../../../common/IconButton';

emmet(CodeMirror);

const INDENTATION_AMOUNT = 2;

const Editor = (props) => {
  const [docs, setDocs] = useState({});
  const [cmInst, setCmInst] = useState(null);
  const beep = useRef(new Audio(beepUrl));
  const codemirrorContainer = useRef(null);

  const updateLintingMessageAccessibility = useCallback(
    debounce((annotations) => {
      props.clearLintMessage();
      annotations.forEach((x) => {
        if (x.from.line > -1) {
          props.updateLintMessage(x.severity, x.from.line + 1, x.message);
        }
      });
      if (props.lintMessages.length > 0 && props.lintWarning) {
        beep.current.play();
      }
    }, 2000),
    [props]
  );

  const prettierFormatWithCursor = (parser, plugins) => {
    try {
      const { formatted, cursorOffset } = prettier.formatWithCursor(
        cmInst.doc.getValue(),
        {
          cursorOffset: cmInst.doc.indexFromPos(cmInst.doc.getCursor()),
          parser,
          plugins
        }
      );
      const { left, top } = cmInst.getScrollInfo();
      cmInst.doc.setValue(formatted);
      cmInst.focus();
      cmInst.doc.setCursor(cmInst.doc.posFromIndex(cursorOffset));
      cmInst.scrollTo(left, top);
    } catch (error) {
      console.error(error);
    }
  };

  const tidyCode = useCallback(() => {
    const mode = cmInst.getOption('mode');
    if (mode === 'javascript') {
      prettierFormatWithCursor('babel', [babelParser]);
    } else if (mode === 'css') {
      prettierFormatWithCursor('css', [cssParser]);
    } else if (mode === 'htmlmixed') {
      prettierFormatWithCursor('html', [htmlParser]);
    }
  }, [cmInst]);

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
    } else if (fileName.match(/.+\.(vert|stl)$/i)) {
      mode = 'x-shader/x-vertex';
    } else {
      mode = 'text/plain';
    }
    return mode;
  };

  const initializeDocuments = (files) => {
    const newDocs = {};
    files.forEach((file) => {
      if (file.name !== 'root') {
        newDocs[file.id] = CodeMirror.Doc(file.content, getFileMode(file.name));
      }
    });
    setDocs(newDocs);
  };

  useEffect(() => {
    if (!cmInst) {
      const cm = CodeMirror(codemirrorContainer.current, {
        theme: `p5-${props.theme}`,
        lineNumbers: props.lineNumbers,
        styleActiveLine: true,
        inputStyle: 'contenteditable',
        lineWrapping: props.linewrap,
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
        /* eslint-disable-next-line react/prop-types */
        autoCloseBrackets: props.autocloseBracketsQuotes,
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

      const hinterInstance = new Fuse(hinter.p5Hinter, {
        threshold: 0.05,
        keys: ['text']
      });

      cm.setOption('extraKeys', {
        Tab: (cmInst) => {
          if (!cmInst.execCommand('emmetExpandAbbreviation')) return;
          const selection = cmInst.doc.getSelection();
          if (selection.length > 0) {
            cmInst.execCommand('indentMore');
          } else {
            cmInst.replaceSelection(' '.repeat(INDENTATION_AMOUNT));
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
        [`${metaKey}-R`]: 'replace',
        [`Shift-${metaKey}-R`]: 'replaceAll',
        [`Ctrl-Space`]: (cmInst) => {
          const cursor = cmInst.doc.getCursor();
          const token = cmInst.getTokenAt(cursor);
          if (token) {
            const hintResults = hinterInstance.search(token.string);
            const htmlHints = {
              from: CodeMirror.Pos(cursor.line, token.start),
              to: CodeMirror.Pos(cursor.line, token.end),
              list: hintResults.map((result) => result.text)
            };
            CodeMirror.showHint(cmInst, () => htmlHints);
          }
        }
      });

      cm.on('change', (doc) => {
        if (props.file.id in docs && docs[props.file.id] !== doc) {
          props.saveFile({
            ...props.file,
            content: doc.getValue()
          });
        }
      });

      cm.on('focus', (cmInst) => {
        const cursor = cmInst.doc.getCursor();
        props.editorFocus(props.file.name, cursor.line + 1, cursor.ch + 1);
      });

      cm.on('cursorActivity', (cmInst) => {
        const cursor = cmInst.doc.getCursor();
        props.editorFocus(props.file.name, cursor.line + 1, cursor.ch + 1);
      });

      cm.on('blur', () => {
        props.editorBlur();
      });

      setCmInst(cm);
      initializeDocuments(props.files);
    } else if (props.files !== Object.keys(docs).length) {
      initializeDocuments(props.files);
    }
  }, [cmInst, props, docs]);

  useEffect(() => {
    if (cmInst && props.file && docs[props.file.id]) {
      cmInst.swapDoc(docs[props.file.id]);
      cmInst.focus();
    }
  }, [cmInst, props.file, docs]);

  useEffect(() => {
    if (cmInst) {
      cmInst.setOption('theme', `p5-${props.theme}`);
      cmInst.setOption('lineNumbers', props.lineNumbers);
      cmInst.setOption('lineWrapping', props.linewrap);
      /* eslint-disable-next-line react/prop-types */
      cmInst.setOption('autoCloseBrackets', props.autocloseBracketsQuotes);
    }
  }, [
    props.theme,
    props.lineNumbers,
    props.linewrap,
    /* eslint-disable-next-line react/prop-types */
    props.autocloseBracketsQuotes
  ]);

  return (
    <div className={props.className}>
      <div ref={codemirrorContainer}></div>
      <MediaQuery maxWidth={600}>
        {(matches) =>
          matches && (
            <div>
              <IconButton
                aria-label="Open Files"
                onClick={props.toggleFilesSidebar}
                icon={<FolderIcon />}
              />
            </div>
          )
        }
      </MediaQuery>
      <div>
        <Timer />
        <IconButton
          aria-label={props.t('editor.accessibility')}
          onClick={() => {
            const { editorAccessibilityModalVisible } = props;
            if (editorAccessibilityModalVisible) {
              props.closeEditorAccessibilityModal();
            } else {
              props.openEditorAccessibilityModal();
            }
          }}
          icon={<EditorAccessibility />}
        />
        <UnsavedChangesIndicator />
      </div>
      <AssetPreview />
    </div>
  );
};

Editor.propTypes = {
  autoCloseBracketsQuotes: PropertyType.bool.isRequired,
  className: PropertyType.string.isRequired,
  clearLintMessage: PropertyType.func.isRequired,
  editorBlur: PropertyType.func.isRequired,
  editorFocus: PropertyType.func.isRequired,
  file: PropertyType.objectOf(PropertyType.object()).isRequired,
  files: PropertyType.arrayOf(PropertyType.object).isRequired,
  lintMessages: PropertyType.arrayOf(PropertyType.object).isRequired,
  lintWarning: PropertyType.bool.isRequired,
  lineNumbers: PropertyType.bool.isRequired,
  linewrap: PropertyType.bool.isRequired,
  openEditorAccessibilityModal: PropertyType.func.isRequired,
  closeEditorAccessibilityModal: PropertyType.func.isRequired,
  editorAccessibilityModalVisible: PropertyType.bool.isRequired,
  saveFile: PropertyType.func.isRequired,
  theme: PropertyType.string.isRequired,
  t: PropertyType.func.isRequired,
  toggleFilesSidebar: PropertyType.func.isRequired,
  updateLintMessage: PropertyType.func.isRequired
};

const mapStateToProps = (state) => ({
  editorAccessibilityModalVisible:
    state.editorAccessibility.editorAccessibilityModalVisible,
  files: state.files.files,
  file: selectActiveFile(state),
  lintMessages: state.ide.lintMessages,
  lintWarning: state.preferences.lintWarning,
  theme: state.preferences.theme,
  lineNumbers: state.preferences.lineNumbers,
  linewrap: state.preferences.linewrap,
  autocloseBracketsQuotes: state.preferences.autocloseBracketsQuotes
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ...FileActions,
      ...IDEActions,
      ...ProjectActions,
      ...EditorAccessibilityActions,
      ...PreferencesActions,
      ...UserActions,
      ...ConsoleActions
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(Editor));
