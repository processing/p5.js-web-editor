import { EditorView } from '@codemirror/view';
import { remSize } from '../../../theme';

export const createLintStyleOverrides = (colors) =>
  EditorView.baseTheme({
    '.cm-gutter-lint': {
      '& .cm-gutterElement': {
        padding: 0,
        '& .cm-lint-marker': {
          width: '100%',
          height: '100%',
          opacity: 0.2
        },
        '& .cm-lint-marker-error': {
          content: 'none',
          backgroundColor: colors.lintError || 'rgb(255, 95, 82)'
        },
        '& .cm-lint-marker-warning': {
          content: 'none',
          backgroundColor: colors.lintWarning || 'rgb(255, 190, 5)'
        }
      }
    }
  });

export const createFoldStyleOverrides = (colors) =>
  EditorView.baseTheme({
    '.cm-foldGutter .cm-gutterElement': {
      cursor: 'pointer',
      textAlign: 'right',
      color: colors.foldGutter || 'rgba(0,0,0,0.2)'
    }
  });

export const createBaseP5Theme = () =>
  EditorView.baseTheme({
    '.cm-scroller': {
      fontFamily: 'Inconsolata, monospace'
    },
    '.cm-gutters': {
      width: remSize(48)
    },
    '.cm-gutter': {
      width: '100%',
      position: 'absolute'
    }
  });

export const createGutterStyles = (colors) => ({
  '.cm-gutters': {
    backgroundColor: colors.gutterBackground,
    width: '2.7em'
  },
  '.cm-lineNumbers': {
    paddingRight: '10px',
    '& .cm-gutterElement': {
      width: '32px',
      left: '-3px',
      color: colors.lineNumber
    }
  }
});

export const createLineStyles = () => ({
  '.cm-line': {
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    wordBreak: 'normal'
  },
  '.cm-content': {
    maxWidth: 'calc(100% - 2.7em)'
  }
});

export const createSelectionStyles = (colors) => ({
  '.CodeMirror-selected': {
    backgroundColor: colors.selection
  },
  '.cm-activeLine': {
    backgroundColor: colors.activeLine
  },
  '.cm-activeLineGutter': {
    backgroundColor: colors.activeLine,
    borderRight: `1px solid ${colors.activeLineGutter}`
  }
});

export const createCursorAndBracketStyles = (colors) => ({
  '.CodeMirror-cursor': {
    borderLeft: `1px solid ${colors.cursor}`
  },
  '.cm-matchingBracket': {
    outline: `1px solid ${colors.bracket}`,
    outlineOffset: '1px',
    color: `${colors.text} !important`
  }
});

export const createErrorAndSearchStyles = (colors) => ({
  '.cm-error': {
    color: colors.error
  },
  '.cm-searchMatch': {
    backgroundColor: colors.searchMatch
  }
});

export const createHighlightClasses = (colors) => ({
  '.cm-qualifier': { color: colors.qualifier },
  '.cm-tag': { color: colors.tag },
  '.cm-builtin': { color: colors.builtin },
  '.cm-attribute': { color: colors.attribute },
  '.cm-p5-function': { color: colors.function, fontWeight: 'bold' },
  '.cm-p5-variable': { color: colors.variable, fontWeight: 'bold' },
  '.cm-foldPlaceholder': {
    backgroundColor: colors.foldPlaceholderBackground,
    color: colors.foldPlaceholderColor
  }
});
