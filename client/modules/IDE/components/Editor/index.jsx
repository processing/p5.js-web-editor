// TODO: convert to functional component

import PropTypes from 'prop-types';
import React from 'react';
import CodeMirror from 'codemirror';
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
import getFileMode from './utils';
import tidyCode from './tidier';
import setupCodeMirror from './codemirror';

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLine: 1
    };
    this._cm = null;

    this.updateLintingMessageAccessibility = debounce((annotations) => {
      this.props.clearLintMessage();
      annotations.forEach((x) => {
        if (x.from.line > -1) {
          this.props.updateLintMessage(x.severity, x.from.line + 1, x.message);
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
    this.initializeDocuments(this.props.files);

    this._cm = setupCodeMirror(
      this.codemirrorContainer,
      this.props,
      (annotations) => {
        this.updateLintingMessageAccessibility(annotations);
      },
      this._docs,
      (lineNumber) => this.setState({ currentLine: lineNumber })
    );

    this.props.provideController({
      tidyCode: () => tidyCode(this._cm),
      showFind: this.showFind,
      showReplace: this.showReplace,
      getContent: this.getContent
    });
  }

  componentWillUpdate(nextProps) {
    // check if files have changed
    if (this.props.files[0].id !== nextProps.files[0].id) {
      // then need to make CodeMirror documents
      this.initializeDocuments(nextProps.files);
    }
    if (this.props.files.length !== nextProps.files.length) {
      this.initializeDocuments(nextProps.files);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.file.id !== prevProps.file.id) {
      const fileMode = getFileMode(this.props.file.name);
      if (fileMode === 'javascript') {
        // Define the new Emmet configuration based on the file mode
        const emmetConfig = {
          preview: ['html'],
          markTagPairs: false,
          autoRenameTags: true
        };
        this._cm.setOption('emmet', emmetConfig);
      }
      const oldDoc = this._cm.swapDoc(this._docs[this.props.file.id]);
      this._docs[prevProps.file.id] = oldDoc;
      this._cm.focus();

      if (!prevProps.unsavedChanges) {
        setTimeout(() => this.props.setUnsavedChanges(false), 400);
      }
    }
    if (this.props.fontSize !== prevProps.fontSize) {
      this._cm.getWrapperElement().style[
        'font-size'
      ] = `${this.props.fontSize}px`;
    }
    if (this.props.linewrap !== prevProps.linewrap) {
      this._cm.setOption('lineWrapping', this.props.linewrap);
    }
    if (this.props.theme !== prevProps.theme) {
      this._cm.setOption('theme', `p5-${this.props.theme}`);
    }
    if (this.props.lineNumbers !== prevProps.lineNumbers) {
      this._cm.setOption('lineNumbers', this.props.lineNumbers);
    }
    if (
      this.props.autocloseBracketsQuotes !== prevProps.autocloseBracketsQuotes
    ) {
      this._cm.setOption(
        'autoCloseBrackets',
        this.props.autocloseBracketsQuotes
      );
    }
    if (this.props.autocompleteHinter !== prevProps.autocompleteHinter) {
      if (!this.props.autocompleteHinter) {
        // close the hinter window once the preference is turned off
        hideHinter(this._cm);
      }
    }

    if (this.props.runtimeErrorWarningVisible) {
      if (this.props.consoleEvents.length !== prevProps.consoleEvents.length) {
        this.props.consoleEvents.forEach((consoleEvent) => {
          if (consoleEvent.method === 'error') {
            // It doesn't work if you create a new Error, but this works
            // LOL
            const errorObj = { stack: consoleEvent.data[0].toString() };
            StackTrace.fromError(errorObj).then((stackLines) => {
              this.props.expandConsole();
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
              this.props.setSelectedFile(fileWithError.id);
              this._cm.addLineClass(
                line.lineNumber - 1,
                'background',
                'line-runtime-error'
              );
            });
          }
        });
      } else {
        for (let i = 0; i < this._cm.lineCount(); i += 1) {
          this._cm.removeLineClass(i, 'background', 'line-runtime-error');
        }
      }
    }

    if (this.props.file.id !== prevProps.file.id) {
      for (let i = 0; i < this._cm.lineCount(); i += 1) {
        this._cm.removeLineClass(i, 'background', 'line-runtime-error');
      }
    }

    this.props.provideController({
      tidyCode: () => tidyCode(this._cm),
      showFind: this.showFind,
      showReplace: this.showReplace,
      getContent: this.getContent
    });
  }

  componentWillUnmount() {
    if (this._cm) {
      this._cm.off('keyup', this.handleKeyUp);
    }
    this.props.provideController(null);
  }

  getContent() {
    const content = this._cm.getValue();
    const updatedFile = Object.assign({}, this.props.file, { content });
    return updatedFile;
  }

  showFind() {
    this._cm.execCommand('findPersistent');
  }

  showReplace() {
    this._cm.execCommand('replace');
  }

  initializeDocuments(files) {
    this._docs = {};
    files.forEach((file) => {
      if (file.name !== 'root') {
        this._docs[file.id] = CodeMirror.Doc(
          file.content,
          getFileMode(file.name)
        ); // eslint-disable-line
      }
    });
  }

  render() {
    const editorSectionClass = classNames({
      editor: true,
      'sidebar--contracted': !this.props.isExpanded
    });

    const editorHolderClass = classNames({
      'editor-holder': true,
      'editor-holder--hidden':
        this.props.file.fileType === 'folder' || this.props.file.url
    });

    const { currentLine } = this.state;

    return (
      <MediaQuery minWidth={770}>
        {(matches) =>
          matches ? (
            <section className={editorSectionClass}>
              <div className="editor__header">
                <button
                  aria-label={this.props.t('Editor.OpenSketchARIA')}
                  className="sidebar__contract"
                  onClick={() => {
                    this.props.collapseSidebar();
                    this.props.closeProjectOptions();
                  }}
                >
                  <LeftArrowIcon focusable="false" aria-hidden="true" />
                </button>
                <button
                  aria-label={this.props.t('Editor.CloseSketchARIA')}
                  className="sidebar__expand"
                  onClick={this.props.expandSidebar}
                >
                  <RightArrowIcon focusable="false" aria-hidden="true" />
                </button>
                <div className="editor__file-name">
                  <span>
                    {this.props.file.name}
                    <UnsavedChangesIndicator />
                  </span>
                  <Timer />
                </div>
              </div>
              <article
                ref={(element) => {
                  this.codemirrorContainer = element;
                }}
                className={editorHolderClass}
              />
              {this.props.file.url ? (
                <AssetPreview
                  url={this.props.file.url}
                  name={this.props.file.name}
                />
              ) : null}
              <EditorAccessibility
                lintMessages={this.props.lintMessages}
                currentLine={currentLine}
              />
            </section>
          ) : (
            <EditorContainer expanded={this.props.isExpanded}>
              <div>
                <IconButton
                  onClick={this.props.expandSidebar}
                  icon={FolderIcon}
                />
                <span>
                  {this.props.file.name}
                  <UnsavedChangesIndicator />
                </span>
              </div>
              <section>
                <EditorHolder
                  ref={(element) => {
                    this.codemirrorContainer = element;
                  }}
                />
                {this.props.file.url ? (
                  <AssetPreview
                    url={this.props.file.url}
                    name={this.props.file.name}
                  />
                ) : null}
                <EditorAccessibility
                  lintMessages={this.props.lintMessages}
                  currentLine={currentLine}
                />
              </section>
            </EditorContainer>
          )
        }
      </MediaQuery>
    );
  }
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
  // updateFileContent: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    url: PropTypes.string
  }).isRequired,
  setUnsavedChanges: PropTypes.func.isRequired,
  // startSketch: PropTypes.func.isRequired,
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
  isExpanded: PropTypes.bool.isRequired,
  collapseSidebar: PropTypes.func.isRequired,
  closeProjectOptions: PropTypes.func.isRequired,
  expandSidebar: PropTypes.func.isRequired,
  // clearConsole: PropTypes.func.isRequired,
  // hideRuntimeErrorWarning: PropTypes.func.isRequired,
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
