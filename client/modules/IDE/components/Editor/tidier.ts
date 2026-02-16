import prettier from 'prettier/standalone';
import babelParser from 'prettier/parser-babel';
import htmlParser from 'prettier/parser-html';
import cssParser from 'prettier/parser-postcss';
import type { EditorView } from '@codemirror/view';
import type { Plugin } from 'prettier';

type parserTypes = 'babel' | 'html' | 'css';
type FormatMode = 'html' | 'css' | 'javascript';

function prettierFormatWithCursor(
  parser: parserTypes,
  plugins: Plugin[],
  cmView: EditorView
) {
  const { doc } = cmView.state;
  const cursorOffset = cmView.state.selection.main.head;
  const {
    formatted,
    cursorOffset: newCursorOffset
  } = prettier.formatWithCursor(doc.toString(), {
    cursorOffset,
    parser,
    plugins
  });

  cmView.dispatch({
    changes: { from: 0, to: doc.length, insert: formatted },
    selection: { anchor: newCursorOffset }
  });

  cmView.focus();
}

/** Runs prettier on the codemirror instance, depending on the mode. */
export default function tidyCodeWithPrettier(
  cmView: EditorView,
  mode: FormatMode
) {
  if (mode === 'javascript') {
    prettierFormatWithCursor('babel', [babelParser], cmView);
  } else if (mode === 'css') {
    prettierFormatWithCursor('css', [cssParser], cmView);
  } else if (mode === 'html') {
    prettierFormatWithCursor('html', [htmlParser], cmView);
  }
}
