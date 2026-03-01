import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tidyCodeWithPrettier } from './tidier';

describe('tidyCodeWithPrettier', () => {
  function createEditor(content: string) {
    const state = EditorState.create({ doc: content });
    return new EditorView({ state });
  }

  function getDocText(cmView: EditorView) {
    return cmView.state.doc.toString();
  }

  function getCursor(cmView: EditorView) {
    return cmView.state.selection.main.head;
  }

  it('formats JavaScript correctly and keeps cursor stable', () => {
    const messyJs = `function foo(){console.log("hi")}`;
    const cmView = createEditor(messyJs);
    cmView.dispatch({ selection: { anchor: 14 } });

    tidyCodeWithPrettier(cmView, 'javascript');

    const expectedJs = 'function foo() {\n  console.log("hi");\n}\n';
    expect(getDocText(cmView)).toBe(expectedJs);

    const newCursor = getCursor(cmView);
    expect(newCursor).toBeGreaterThan(0);
  });

  it('formats HTML correctly and keeps cursor stable', () => {
    const messyHtml = `<html><body>hello</body></html>`;
    const cmView = createEditor(messyHtml);
    tidyCodeWithPrettier(cmView, 'html');

    const expectedHtml = '<html>\n  <body>\n    hello\n  </body>\n</html>\n';
    expect(getDocText(cmView)).toBe(expectedHtml);
  });

  it('formats CSS correctly and keeps cursor stable', () => {
    const messyCss = `body{margin:0;padding:0;}`;
    const cmView = createEditor(messyCss);

    tidyCodeWithPrettier(cmView, 'css');

    const expectedCss = 'body {\n  margin: 0;\n  padding: 0;\n}\n';
    expect(getDocText(cmView)).toBe(expectedCss);
  });

  it('handles an empty document without errors', () => {
    const cmView = createEditor('');
    expect(() => tidyCodeWithPrettier(cmView, 'javascript')).not.toThrow();
    expect(getDocText(cmView)).toBe('');
  });

  it('leaves the cursor unmoved if the code is already formatted', () => {
    const cleanCode = 'function foo() {}\n';
    const cmView = createEditor(cleanCode);
    cmView.dispatch({ selection: { anchor: 5 } });

    tidyCodeWithPrettier(cmView, 'javascript');

    expect(getCursor(cmView)).toBe(5);
  });
});
