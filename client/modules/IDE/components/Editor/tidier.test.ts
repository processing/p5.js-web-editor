import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import tidyCodeWithPrettier from './tidier';

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

    const formattedJs = getDocText(cmView);
    expect(formattedJs).toContain('console.log("hi");');
    const newCursor = getCursor(cmView);
    expect(newCursor).toBeGreaterThan(0);
    expect(newCursor).toBeLessThanOrEqual(formattedJs.length);
  });

  it('formats HTML correctly and keeps cursor stable', () => {
    const messyHtml = `<div><p>hello</p></div>`;
    const cmView = createEditor(messyHtml);

    cmView.dispatch({ selection: { anchor: 5 } });

    tidyCodeWithPrettier(cmView, 'html');

    const formattedHtml = getDocText(cmView);
    expect(formattedHtml).toContain('<p>hello</p>');
    const newCursor = getCursor(cmView);
    expect(newCursor).toBeGreaterThan(0);
    expect(newCursor).toBeLessThanOrEqual(formattedHtml.length);
  });

  it('formats CSS correctly and keeps cursor stable', () => {
    const messyCss = `body{margin:0;padding:0;}`;
    const cmView = createEditor(messyCss);

    cmView.dispatch({ selection: { anchor: 6 } });

    tidyCodeWithPrettier(cmView, 'css');

    const formattedCss = getDocText(cmView);
    expect(formattedCss).toContain('margin: 0;');
    const newCursor = getCursor(cmView);
    expect(newCursor).toBeGreaterThan(0);
    expect(newCursor).toBeLessThanOrEqual(formattedCss.length);
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
