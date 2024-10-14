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

const contrastColors = {
  background: '#1C1C1C',
  text: '#FDFDFD',
  gutterBackground: '#454545',
  lineNumber: '#FDFDFD',
  selection: 'rgba(45, 123, 182, 0.25)',
  activeLine: '#999999',
  activeLineGutter: '#333333',
  cursor: '#FDFDFD',
  bracket: '#C1C1C1',
  error: '#f00',
  searchMatch: '#333333',
  searchSelectedTextOutline: '#FDFDFD',
  qualifier: '#F5DC23',
  tag: '#FFA95D',
  builtin: '#F5DC23',
  attribute: '#FDFDFD',
  function: '#00FFFF',
  variable: '#FFA9D9',
  foldPlaceholderBackground: '#FDFDFD',
  foldPlaceholderColor: '#333333',
  keyword: '#F5DC23',
  atom: '#FFA9D9',
  string: '#2DE9B6',
  number: '#FDFDFD',
  regexp: '#2DE9B6',
  specialVariable: '#FDFDFD',
  typeName: '#F5DC23',
  comment: '#C1C1C1',
  operator: '#C1C1C1'
};

const contrastHighlightStyle = createHighlightStyle(contrastColors);
const contrastThemeStyles = {
  '&': {
    backgroundColor: contrastColors.background,
    color: contrastColors.text,
    fontFamily: 'Inconsolata, monospace',
    height: '100%'
  },
  '&.cm-focused': {
    outline: 'none'
  },
  ...createGutterStyles(contrastColors),
  ...createLineStyles(),
  ...createSelectionStyles(contrastColors),
  ...createCursorAndBracketStyles(contrastColors),
  ...createErrorAndSearchStyles(contrastColors),
  ...createHighlightClasses(contrastColors),
  '.CodeMirror-selectedtext': {
    backgroundColor: contrastColors.activeLineGutter,
    outline: `${contrastColors.searchSelectedTextOutline}`
  }
};

const p5ContrastTheme = EditorView.theme(contrastThemeStyles, { dark: true });
export { p5ContrastTheme, contrastHighlightStyle };
