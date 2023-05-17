import babelParser from 'prettier/parser-babel';
import htmlParser from 'prettier/parser-html';
import cssParser from 'prettier/parser-postcss';
import prettier from 'prettier/standalone';
import { getFileExtension } from './language';
import { replaceContent } from './util';

// TODO: should this be a CodeMirror extension?

export default function tidyCode(editor, fileName) {
  /**
   * @param {import('prettier').BuiltInParserName} parser
   * @param {Array<import('prettier').Plugin>} plugins
   */
  function prettierFormatWithCursor(parser, plugins) {
    try {
      const { formatted, cursorOffset } = prettier.formatWithCursor(
        editor.state.doc.toString(),
        {
          cursorOffset: editor.state.selection.main.head,
          parser,
          plugins
          // TODO: use filepath option? https://prettier.io/docs/en/options.html#file-path
        }
      );
      // const { left, top } = this._cm5.getScrollInfo();
      replaceContent(editor, formatted); // TODO: make sure this syncs to redux
      editor.focus();
      editor.dispatch({
        selection: { anchor: cursorOffset }
      });
      // this._cm5.scrollTo(left, top);
    } catch (error) {
      console.error(error);
    }
  }

  // TODO: more parsers: https://prettier.io/docs/en/options.html#parser
  const fileExt = getFileExtension(fileName);
  if (fileExt === 'js') {
    // .jsx? .ts? .tsx?
    prettierFormatWithCursor('babel', [babelParser]);
  } else if (fileExt === 'css') {
    // .less? .scss?
    prettierFormatWithCursor('css', [cssParser]);
  } else if (fileExt === 'html' || fileExt === 'xml') {
    prettierFormatWithCursor('html', [htmlParser]);
  }
  // TODO: remove this, for dev only
  else {
    console.log(`No formatter for file type ${fileExt}`);
  }
}
