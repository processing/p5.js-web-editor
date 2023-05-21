import { EditorView } from '@codemirror/view';
import { remSize } from '../../theme';

const lintStyleOverrides = EditorView.baseTheme({
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
        backgroundColor: 'rgb(255, 95, 82)'
      },
      '& .cm-lint-marker-warning': {
        content: 'none',
        backgroundColor: 'rgb(255, 190, 5)'
      }
    }
  }
});
// TODO: lintPoint, zig-zag underline

const foldStyleOverrides = EditorView.baseTheme({
  '.cm-foldGutter .cm-gutterElement': {
    cursor: 'pointer',
    textAlign: 'right',
    color: 'rgba(0,0,0,0.2)' // TODO: correct color based on theme
  },
  '.cm-foldPlaceholder': {
    // TODO: is currently in _editor.scss
  }
});

const baseP5Theme = EditorView.baseTheme({
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

export default [lintStyleOverrides, foldStyleOverrides, baseP5Theme];
