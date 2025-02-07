import prettier from 'prettier/standalone';
import babelParser from 'prettier/parser-babel';
import htmlParser from 'prettier/parser-html';
import cssParser from 'prettier/parser-postcss';

function prettierFormatWithCursor(parser, plugins, cmInstance) {
  try {
    const { formatted, cursorOffset } = prettier.formatWithCursor(
      cmInstance.doc.getValue(),
      {
        cursorOffset: cmInstance.doc.indexFromPos(cmInstance.doc.getCursor()),
        parser,
        plugins
      }
    );
    const { left, top } = cmInstance.getScrollInfo();
    cmInstance.doc.setValue(formatted);
    cmInstance.focus();
    cmInstance.doc.setCursor(cmInstance.doc.posFromIndex(cursorOffset));
    cmInstance.scrollTo(left, top);
  } catch (error) {
    console.error(error);
  }
}

/** Runs prettier on the codemirror instance, depending on the mode. */
export default function tidyCode(cmInstance) {
  const mode = cmInstance.getOption('mode');
  if (mode === 'javascript') {
    prettierFormatWithCursor('babel', [babelParser], cmInstance);
  } else if (mode === 'css') {
    prettierFormatWithCursor('css', [cssParser], cmInstance);
  } else if (mode === 'htmlmixed') {
    prettierFormatWithCursor('html', [htmlParser], cmInstance);
  }
}
