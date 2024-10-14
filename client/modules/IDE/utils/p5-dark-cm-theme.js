import { EditorView } from '@codemirror/view';
import createHighlightStyle from './highlightStyle';
import {
  createGutterStyles,
  createLineStyles,
  createSelectionStyles,
  createCursorAndBracketStyles,
  createErrorAndSearchStyles,
  createHighlightClasses
} from './sharedStyles';

const darkColors = {
  background: '#1C1C1C',
  text: '#FDFDFD',
  gutterBackground: '#f4f4f4',
  lineNumber: '#b5b5b5',
  selection: 'rgba(45, 123, 182, 0.25)',
  activeLine: '#CFCFCF',
  activeLineGutter: '#666666',
  cursor: '#FDFDFD',
  bracket: '#9B9B9B',
  error: '#df3a3d',
  searchMatch: 'rgba(217, 50, 143, 0.5)',
  qualifier: '#0F9DD7',
  tag: '#DE4A9B',
  builtin: '#0F9DD7',
  attribute: '#FDFDFD',
  function: '#0F9DD7',
  variable: '#DE4A9B',
  foldPlaceholderBackground: '#FDFDFD',
  foldPlaceholderColor: '#1C1C1C',
  keyword: '#b58318',
  atom: '#DE4A9B',
  string: '#58a10b',
  number: '#FDFDFD',
  regexp: '#EE9900',
  specialVariable: '#666666',
  typeName: '#DE4A9B',
  comment: '#9B9B9B',
  operator: '#A67F59'
};

const darkHighlightStyle = createHighlightStyle(darkColors);
const darkThemeStyles = {
  '&': {
    backgroundColor: darkColors.background,
    color: darkColors.text,
    fontFamily: 'Inconsolata, monospace',
    height: '100%'
  },
  '&.cm-focused': {
    outline: 'none'
  },
  ...createGutterStyles(darkColors),
  ...createLineStyles(),
  ...createSelectionStyles(darkColors),
  ...createCursorAndBracketStyles(darkColors),
  ...createErrorAndSearchStyles(darkColors),
  ...createHighlightClasses(darkColors),
  '.CodeMirror-selectedtext': {
    backgroundColor: darkColors.activeLineGutter
  }
};

const p5DarkTheme = EditorView.theme(darkThemeStyles, {
  dark: true,
  themeClass: 'cm-s-p5-dark'
});

export { p5DarkTheme, darkHighlightStyle };
