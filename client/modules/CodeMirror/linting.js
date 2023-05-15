import { cssLanguage } from '@codemirror/lang-css';
import { htmlLanguage } from '@codemirror/lang-html';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { CSSLint } from 'csslint';
import { HTMLHint } from 'htmlhint';
import { JSHINT } from 'jshint';

// Note: probably not needed in v6
window.JSHINT = JSHINT;
window.CSSLint = CSSLint;
window.HTMLHint = HTMLHint;

/**
 * Find the sections of the document in each language.
 * Lint with the appropriate linter.
 * Map warnings/errors to the correct format.
 *
 * @param {import('@codemirror/view').EditorView} view
 * @return {Array<import('@codemirror/lint').Diagnostic>}
 */
export default function lintSource(view) {
  const cssRegions = cssLanguage.findRegions(view.state);
  const diagnostics = cssRegions.flatMap(({ from, to }) => {
    const content = view.state.doc.sliceString(from, to);
    const errors = CSSLint.verify(content).messages;
    console.log(errors);
    return errors.map((error) => {
      const line = view.state.doc.line(error.line);
      return {
        severity: error.type,
        message: error.message,
        source: 'CSSLint',
        from: from + line.from + error.col - 1,
        to: from + line.from + error.col - 1 // TODO: length
      };
    });
  });

  const jsRegions = javascriptLanguage.findRegions(view.state);
  diagnostics.push(
    ...jsRegions.flatMap(({ from, to }) => {
      const content = view.state.doc.sliceString(from, to);
      JSHINT(content, { esversion: 6 });
      console.log(JSHINT.errors, JSHINT);
      return JSHINT.errors.map((error) => {
        const line = view.state.doc.line(error.line);
        return {
          severity: 'error', // TODO
          message: error.reason,
          source: 'JSHINT',
          from: from + line.from + error.character - 1,
          to: from + line.from + error.character - 1 // TODO: length
        };
      });
    })
  );

  const htmlRegions = htmlLanguage.findRegions(view.state);
  // TODO: HTML

  return diagnostics;
}
