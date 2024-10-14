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

const lightColors = {
  background: '#FDFDFD',
  text: '#333333',
  gutterBackground: '#F4F4F4',
  lineNumber: '#B5B5B5',
  selection: 'rgba(45, 123, 182, 0.25)',
  activeLine: '#CFCFCF',
  activeLineGutter: '#999999',
  cursor: '#333333',
  bracket: '#666666',
  error: '#f00',
  searchMatch: 'rgba(213, 40, 137, 0.5)',
  qualifier: '#0B7CA9',
  tag: '#D52889',
  builtin: '#0B7CA9',
  attribute: '#666666',
  function: '#0B7CA9',
  variable: '#D52889',
  foldPlaceholderBackground: '#333333',
  foldPlaceholderColor: '#FDFDFD',
  keyword: '#7A5A3A',
  atom: '#D52889',
  string: '#47820A',
  number: '#B5B5B5',
  regexp: '#A06801',
  specialVariable: '#666666',
  typeName: '#D52889',
  comment: '#666666',
  operator: '#7A5A3A',
  lintError: 'rgb(255, 95, 82)',
  lintWarning: 'rgb(255, 190, 5)',
  foldGutter: 'rgba(0, 0, 0, 0.2)'
};

const lightHighlightStyle = createHighlightStyle(lightColors);
const lightThemeStyles = {
  '&': {
    backgroundColor: lightColors.background,
    color: lightColors.text,
    fontFamily: 'Inconsolata, monospace',
    height: '100%'
  },
  '&.cm-focused': {
    outline: 'none'
  },
  ...createGutterStyles(lightColors),
  ...createLineStyles(),
  ...createSelectionStyles(lightColors),
  ...createCursorAndBracketStyles(lightColors),
  ...createErrorAndSearchStyles(lightColors),
  ...createHighlightClasses(lightColors),
  '.CodeMirror-selectedtext': {
    backgroundColor: lightColors.activeLineGutter
  }
};

const p5LightTheme = EditorView.theme(lightThemeStyles, {
  dark: false,
  themeClass: 'cm-s-p5-light'
});
export { p5LightTheme, lightHighlightStyle };
